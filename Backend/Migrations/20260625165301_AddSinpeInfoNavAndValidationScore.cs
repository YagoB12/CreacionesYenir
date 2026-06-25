using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_yenir.Migrations
{
    /// <inheritdoc />
    public partial class AddSinpeInfoNavAndValidationScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentSinpeInfos_PaymentId",
                table: "PaymentSinpeInfos");

            migrationBuilder.AddColumn<int>(
                name: "ValidationScore",
                table: "PaymentSinpeInfos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSinpeInfos_PaymentId",
                table: "PaymentSinpeInfos",
                column: "PaymentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentSinpeInfos_PaymentId",
                table: "PaymentSinpeInfos");

            migrationBuilder.DropColumn(
                name: "ValidationScore",
                table: "PaymentSinpeInfos");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSinpeInfos_PaymentId",
                table: "PaymentSinpeInfos",
                column: "PaymentId");
        }
    }
}
