using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_yenir.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentSinpeInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentSinpeInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Bank = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransferDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransferTime = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DestinationName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DestinationPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RawText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentSinpeInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentSinpeInfos_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSinpeInfos_PaymentId",
                table: "PaymentSinpeInfos",
                column: "PaymentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentSinpeInfos");
        }
    }
}
