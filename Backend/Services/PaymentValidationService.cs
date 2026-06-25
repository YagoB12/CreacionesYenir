using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.EntityFrameworkCore;

using backend_yenir.DTOs;


namespace backend_yenir.Services
{
    public class PaymentValidationService
    {
        private readonly ApplicationDbContext _context;

        public PaymentValidationService(ApplicationDbContext context)
        {
            _context = context;
        }


        public async Task<(int Score, string Result, int Status)> ValidateAsync(

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
                Console.WriteLine($"Referencia duplicada detectada: {sinpeInfo.ReferenceNumber}");
                return (0, "RECHAZADO", 3);
            }
            Console.WriteLine($"Referencia OK: {sinpeInfo.ReferenceNumber}");
            score += 20;

            // VALIDAR MONTO
            if (sinpeInfo.Amount.HasValue && payment.TotalPrice == sinpeInfo.Amount.Value)
            {
                Console.WriteLine($"Monto OK: Payment.TotalPrice={payment.TotalPrice}, Sinpe.Amount={sinpeInfo.Amount.Value}");
                score += 20;
            }
            else
            {
                Console.WriteLine($"Monto FALLÓ: Payment.TotalPrice={payment.TotalPrice}, Sinpe.Amount={sinpeInfo.Amount}");
            }

            // VALIDAR TELÉFONO DESTINO
            if (sinpeInfo.DestinationPhone == "8518-2008")
            {
                Console.WriteLine($"Teléfono destino OK: {sinpeInfo.DestinationPhone}");
                score += 20;
            }
            else
            {
                Console.WriteLine($"Teléfono destino FALLÓ: {sinpeInfo.DestinationPhone}");
            }
       
            // VALIDAR NOMBRE DESTINO
            if (sinpeInfo.DestinationName?
                .Contains("Aurora Baltodano Cordero", StringComparison.OrdinalIgnoreCase) == true)
            {
                Console.WriteLine($"Nombre destino OK: {sinpeInfo.DestinationName}");
                score += 20;
            }
            else
            {
                Console.WriteLine($"Nombre destino FALLÓ: {sinpeInfo.DestinationName}");
            }

            // VALIDAR FECHA
            if (sinpeInfo.TransferDate.HasValue)
            {
                var diff = Math.Abs(
                    (payment.DateCreate.Date - sinpeInfo.TransferDate.Value.Date).TotalDays);

                if (diff <= 1)
                {
                    Console.WriteLine($"Fecha OK: Payment.DateCreate={payment.DateCreate.Date}, Sinpe.TransferDate={sinpeInfo.TransferDate.Value.Date}");
                    score += 20;
                }
                else
                {
                    Console.WriteLine($"Fecha FALLÓ: Payment.DateCreate={payment.DateCreate.Date}, Sinpe.TransferDate={sinpeInfo.TransferDate.Value.Date}, diff={diff} días");
                }
            }
            else
            {
                Console.WriteLine("Fecha SIN VALOR");
            }

            string result = score == 100 ? "APROBADO"
                 : score >= 80 ? "REVISION_MANUAL"
                 : "RECHAZADO";

            int status = result switch
            {
                "REVISION_MANUAL" => 1,
                "APROBADO" => 2,
                "RECHAZADO" => 3
            };

            Console.WriteLine($"Resultado final → Score: {score}, Resultado: {result}, Estado: {status}");

            return (score, result, status);

        }
    }
}