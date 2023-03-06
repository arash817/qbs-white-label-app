﻿using Core.Domain;
using Core.Domain.Abstractions;
using Core.Domain.Entities.CustomerAggregate;
using Core.Domain.Primitives;
using Core.Domain.Repositories;
using MediatR;

namespace Core.Application.Commands.CustomerCommands
{
    public class CreateMerchantCommand : IRequest
    {
        public required string CustomerCode { get; set; }

        public required string Email { get; set; }

        public required string CompanyName { get; set; }

        public required string ContactPersonFullName { get; set; }

        public required string CountryOfRegistration { get; set; }

        public required string IP { get; set; }
    }

    public class CreateMerchantCommandHandler : IRequestHandler<CreateMerchantCommand>
    {
        private readonly IComplianceService _compliance;
        private readonly ICustomerRepository _customerRepository;

        public CreateMerchantCommandHandler(IComplianceService compliance,
            ICustomerRepository customerRepository)
        {
            _compliance = compliance;
            _customerRepository = customerRepository;
        }

        public async Task<Unit> Handle(CreateMerchantCommand request, CancellationToken cancellationToken)
        {
            var trustlevels = _compliance.GetTrustlevelsForMerchantCustomer();
            var properties = new MerchantCustomerProperties()
            {
                CustomerCode = request.CustomerCode,
                Email = request.Email,
                CountryOfRegistration = request.CountryOfRegistration,
                CompanyName = request.CompanyName,
                ContactPersonFullName = request.ContactPersonFullName,
                Trustlevel = trustlevels[TierType.Tier1]
            };

            var merchant = Customer.NewMerchantCustomer(properties);

            var complianceCheck = await _compliance.CheckAsync(merchant, request.IP);

            if (!complianceCheck.HasPassed)
            {
                switch (complianceCheck.Result)
                {
                    case ComplianceCheckResult.UsingVPN:
                        merchant.IsUsingVPN(complianceCheck.FailedPropertyName);
                        break;

                    case ComplianceCheckResult.CountryIsBlacklisted:
                        merchant.IsRegisteringFromBlacklistedCountry(complianceCheck.FailedPropertyName);
                        break;

                    case ComplianceCheckResult.Sanctioned:
                        merchant.IsRegisteringWhileSanctioned();
                        break;
                }
            }

            await _customerRepository.CreateAsync(merchant, request.IP, cancellationToken);

            return Unit.Value;
        }
    }
}
