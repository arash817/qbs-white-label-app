﻿// Copyright 2023 Quantoz Technology B.V. and contributors. Licensed
// under the Apache License, Version 2.0. See the NOTICE file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

using Core.Domain;
using Core.Domain.Abstractions;
using Core.Domain.Entities.CustomerAggregate;
using Core.Domain.Primitives;
using Core.Domain.Repositories;
using MediatR;

namespace Core.Application.Commands.CustomerCommands
{
    public class CreateDeviceCommand : IRequest
    {
        public required string CustomerCode { get; set; }

        public required string PublicKey { get; set; }

        public string? OTPCode { get; set; }

        public required string IP { get; set; }
    }

    public class CreateDeviceCommandHandler : IRequestHandler<CreateDeviceCommand>
    {
        private readonly IComplianceService _compliance;
        private readonly ICustomerRepository _customerRepository;

        public CreateDeviceCommandHandler(IComplianceService compliance,
            ICustomerRepository customerRepository)
        {
            _compliance = compliance;
            _customerRepository = customerRepository;
        }

        public async Task<Unit> Handle(CreateDeviceCommand request, CancellationToken cancellationToken)
        {
            var trustlevels = _compliance.GetTrustlevelsForPrivateCustomer();

            var properties = new PrivateCustomerProperties()
            {
                CustomerCode = request.CustomerCode,
                FirstName = request.FirstName,
                LastName = request.LastName,
                CountryOfResidence = request.CountryOfResidence,
                DateOfBirth = request.DateOfBirth,
                Email = request.Email,
                Phone = request.Phone,
                Trustlevel = trustlevels[TierType.Tier1]
            };

            var customer = Customer.NewPrivateCustomer(properties);

            var complianceCheck = await _compliance.CheckAsync(customer, request.IP);

            if (!complianceCheck.HasPassed)
            {
                switch (complianceCheck.Result)
                {
                    case ComplianceCheckResult.UsingVPN:
                        customer.IsUsingVPN(complianceCheck.FailedPropertyName);
                        break;

                    case ComplianceCheckResult.CountryIsBlacklisted:
                        customer.IsRegisteringFromBlacklistedCountry(complianceCheck.FailedPropertyName);
                        break;

                    case ComplianceCheckResult.Sanctioned:
                        customer.IsRegisteringWhileSanctioned();
                        break;
                }
            }

            await _customerRepository.CreateAsync(customer, request.IP);

            return Unit.Value;
        }
    }
}
