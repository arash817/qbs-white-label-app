﻿// Copyright 2023 Quantoz Technology B.V. and contributors. Licensed
// under the Apache License, Version 2.0. See the NOTICE file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

using Core.Application.Queries.Interfaces;
using Core.Domain.Entities.PaymentRequestAggregate;
using Core.Domain.Primitives;
using Core.Domain.Repositories;
using MediatR;

namespace Core.Application.Queries.PaymentRequestQueries
{
    public class GetPagedPaymentRequestsForCustomerQuery : IRequest<Paged<PaymentRequest>>, IPagedQuery
    {
        public string CustomerCode { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public GetPagedPaymentRequestsForCustomerQuery(string customerCode, int page, int pageSize)
        {
            CustomerCode = customerCode;
            Page = page;
            PageSize = pageSize;
        }
    }

    public class GetPagedPaymentRequestsForCustomerQueryHandler : IRequestHandler<GetPagedPaymentRequestsForCustomerQuery, Paged<PaymentRequest>>
    {
        private readonly IPaymentRequestRepository _paymentRequestRepository;

        public GetPagedPaymentRequestsForCustomerQueryHandler(IPaymentRequestRepository paymentRequestRepository)
        {
            _paymentRequestRepository = paymentRequestRepository;
        }

        public Task<Paged<PaymentRequest>> Handle(GetPagedPaymentRequestsForCustomerQuery request, CancellationToken cancellationToken)
        {
            return _paymentRequestRepository.GetAllForCustomerAsync(request.CustomerCode, request.Page, request.PageSize, cancellationToken);
        }
    }


}
