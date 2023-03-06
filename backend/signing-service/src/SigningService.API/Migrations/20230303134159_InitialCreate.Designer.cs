﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SigningService.API.Data;

#nullable disable

namespace SigningService.API.Migrations
{
    [DbContext(typeof(SigningDbContext))]
    [Migration("20230303134159_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("SigningService.API.Data.SigningPair", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("Id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedOn")
                        .HasColumnType("datetime2")
                        .HasColumnName("CreatedOn");

                    b.Property<string>("CryptoCode")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("CryptoCode");

                    b.Property<int?>("Index")
                        .HasColumnType("int")
                        .HasColumnName("Index");

                    b.Property<string>("LabelPartnerCode")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("LabelPartnerCode");

                    b.Property<string>("PublicKey")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("PublicKey");

                    b.HasKey("Id");

                    b.HasIndex("PublicKey")
                        .IsUnique();

                    b.ToTable("SigningPair", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
