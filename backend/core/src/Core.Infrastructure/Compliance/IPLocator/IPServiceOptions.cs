﻿// Copyright 2023 Quantoz Technology B.V. and contributors. Licensed
// under the Apache License, Version 2.0. See the NOTICE file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

using System.ComponentModel.DataAnnotations;

namespace Core.Infrastructure.Compliance.IPLocator
{
    public class IPServiceOptions
    {
        [Required]
        public required string Key { get; set; }
    }
}
