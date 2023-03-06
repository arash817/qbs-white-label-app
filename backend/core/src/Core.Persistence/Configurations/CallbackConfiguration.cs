﻿using Core.Domain.Entities.CallbackAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Persistence.Configurations
{
    internal class CallbackConfiguration : BaseConfiguration<Callback>
    {
        public override void Configure(EntityTypeBuilder<Callback> builder)
        {
            base.Configure(builder);

            builder.ToTable("Callback");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Code)
                .HasColumnName("Code")
                .HasMaxLength(40)
                .IsRequired();

            builder.Property(c => c.Status)
                .HasColumnName("Status")
                .IsRequired();

            builder.Property(c => c.Type)
                .HasColumnName("Type")
                .IsRequired();

            builder.Property(c => c.Content)
                .HasColumnName("Content")
                .HasMaxLength(1000)
                .IsRequired();

            builder.Property(c => c.CreatedOn)
               .HasColumnName("CreatedOn")
               .IsRequired();

            builder.Property(c => c.UpdatedOn)
            .HasColumnName("UpdatedOn");
        }
    }
}
