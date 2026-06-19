using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Services
{
    public class PaymentValidationService
    {
        private readonly ApplicationDbContext _context;

        public PaymentValidationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(int Score, string Result)> ValidateAsync(
            Payment payment,
            PaymentSinpeInfo sinpeInfo)
        {
            int score = 0;

            // VALIDAR REFERENCIA DUPLICADA

            var duplicatedReference =
                await _context.PaymentSinpeInfos
                    .AnyAsync(x =>
                        x.ReferenceNumber == sinpeInfo.ReferenceNumber &&
                        x.PaymentId != payment.Id);

            if (duplicatedReference)
            {
                return (0, "RECHAZADO");
            }

            score += 20;

            // VALIDAR MONTO

            if (
                sinpeInfo.Amount.HasValue &&
                payment.TotalPrice == sinpeInfo.Amount.Value
            )
            {
                score += 20;
            }

            // VALIDAR TELÉFONO DESTINO

            if (sinpeInfo.DestinationPhone == "84090925")
            {
                score += 20;
            }

            // VALIDAR NOMBRE DESTINO

            if (
                sinpeInfo.DestinationName?
                    .Contains(
                        "Aurora Baltodano Cordero",
                        StringComparison.OrdinalIgnoreCase
                    ) == true
            )
            {
                score += 20;
            }

            // VALIDAR FECHA

            if (sinpeInfo.TransferDate.HasValue)
            {
                var diff =
                    Math.Abs(
                        (
                            payment.DateCreate.Date -
                            sinpeInfo.TransferDate.Value.Date
                        ).TotalDays
                    );

                if (diff <= 1)
                {
                    score += 20;
                }
            }

            string result =
                score == 100
                    ? "APROBADO"
                    : score >= 80
                        ? "REVISION_MANUAL"
                        : "RECHAZADO";

            return (score, result);
        }
    }
}