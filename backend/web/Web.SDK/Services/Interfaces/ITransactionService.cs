﻿// Copyright 2023 Quantoz Technology B.V. and contributors. Licensed
// under the Apache License, Version 2.0. See the NOTICE file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

using Web.SDK.ROP;
using Web.SDK.Services.Models.Responses;

namespace Web.SDK.Services.Interfaces
{
    public interface ITransactionService
    {
        public Task<Result<IEnumerable<TransactionResponse>>> GetTransactionsAsync(int page = 1, int pageSize = 10);
    }
}
