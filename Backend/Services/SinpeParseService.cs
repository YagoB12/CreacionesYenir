using System.Globalization;
using System.Text.RegularExpressions;
using backend_yenir.Models;

namespace backend_yenir.Services
{
    public class SinpeParserService
    {
        public PaymentSinpeInfo Parse(string text, int paymentId)
        {
            var normalized = Normalize(text);

            var info = new PaymentSinpeInfo
            {
                PaymentId = paymentId,
                RawText = text,
                Bank = DetectBank(normalized)
            };

            if (info.Bank == "BCR")
                ParseBcr(normalized, info);
            else if (info.Bank == "BANCO POPULAR")
                ParsePopular(normalized, info);
            else if (info.Bank == "BN")
                ParseBn(normalized, info);

            return info;
        }

        private string Normalize(string text)
        {
            return text
                .ToUpper()
                .Replace("\r", "\n");
        }

        private string DetectBank(string text)
        {
            if (
                text.Contains("SINPE MÓVIL DESTINO") ||
                text.Contains("SINPE MOVIL DESTINO") ||
                text.Contains("REFERENCIA") && text.Contains("MONTO TRANSFERIDO")
            )
                return "BCR";

            if (
                text.Contains("BANCO POPULAR") ||
                text.Contains("SERVICIO DESTINO") ||
                text.Contains("NÚM. DE TRANSACCIÓN") ||
                text.Contains("NUM. DE TRANSACCION") ||
                text.Contains("NÚM. DE TRANSACCION") ||
                text.Contains("NUM DE TRANSACCION")
            )
                return "BANCO POPULAR";

            if (
                text.Contains("TRANSFERENCIA BN SINPE") ||
                text.Contains("TRANSACCIÓN PROCESADA") ||
                text.Contains("TRANSACCION PROCESADA") ||
                text.Contains("NÚMERO DE MONEDERO") ||
                text.Contains("NUMERO DE MONEDERO") ||
                text.Contains("COMPROBANTE") && text.Contains("DESTINATARIO")
            )
                return "BN";

            return "DESCONOCIDO";
        }

        private void ParseBcr(string text, PaymentSinpeInfo info)
        {
            info.ReferenceNumber = Match(text, @"REFERENCIA\s+(\d{6,})");
            info.DestinationPhone = Match(text, @"(\d{4}-?\d{4})");
            info.Amount = ExtractAmount(text);

            var date = Match(text, @"(\d{1,2}\s+DE\s+[A-ZÁÉÍÓÚÑ]+,?\s+\d{4})");
            var time = Match(text, @"\b(\d{1,2}:\d{2})\b");

            info.TransferTime = time;

            if (!string.IsNullOrEmpty(date))
                info.TransferDate = ParseSpanishDate(date);

            var name = Match(text,@"SINPE\s+M[ÓO]VIL\s+DESTINO\s+([A-ZÁÉÍÓÚÑ\s]+?)\s+\d{4}-?\d{4}");

            info.DestinationName = CleanName(name);
        }

        private void ParsePopular(string text, PaymentSinpeInfo info)
        {
            info.ReferenceNumber = Match(
                text,
                @"N[ÚU]M\.?\s+DE\s+TRANSACCI[ÓO]N\s+([A-Z0-9]+)"
            );

            info.DestinationPhone =
                Match(text, @"SERVICIO\s+(\d{8})")
                ?? Match(text, @"SERVICIO\s+DESTINO[\s\S]*?SERVICIO\s+(\d{8})");

            info.Amount = ExtractAmount(text);

            var date = Match(text, @"FECHA\s+(\d{2}/\d{2}/\d{4})");
            var time = Match(text, @"(\d{2}:\d{2}:\d{2})");

            if (!string.IsNullOrEmpty(date))
                info.TransferDate = ParseDate(date);

            info.TransferTime = time;

            var nameMatch = Regex.Match(
                text,
                @"A\s+NOMBRE\s+([A-ZÁÉÍÓÚÑ\s]+?)\s+DE\s+([A-ZÁÉÍÓÚÑ\s]+?)\s+MONTO\s+DEPOSITADO",
                RegexOptions.Singleline | RegexOptions.IgnoreCase
            );

            if (nameMatch.Success)
            {
                info.DestinationName = CleanName(
                    $"{nameMatch.Groups[1].Value} {nameMatch.Groups[2].Value}"
                );
            }
            else
            {
                var fallbackName = Match(
                    text,
                    @"A\s+NOMBRE\s+DE\s+([A-ZÁÉÍÓÚÑ\s]+?)\s+MONTO\s+DEPOSITADO"
                );

                info.DestinationName = CleanName(fallbackName);
            }
        }

        private void ParseBn(string text, PaymentSinpeInfo info)
        {
            info.ReferenceNumber =
                Match(text, @"(\d{6,})\s+COMPROBANTE") ??
                Match(text, @"COMPROBANTE:?\s*(\d{6,})");

            info.DestinationPhone =
                Match(text, @"(\d{8})\s+N[ÚU]MERO\s+DE\s+MONEDERO") ??
                Match(text, @"N[ÚU]MERO\s+DE\s+MONEDERO:?\s*(\d{8})");

            info.Amount = ExtractAmount(text);

            var date = Match(text, @"(\d{2}/\d{2}/\d{4})");
            var time = Match(text, @"(\d{2}:\d{2}:\d{2})");

            if (!string.IsNullOrEmpty(date))
                info.TransferDate = ParseDate(date);

            info.TransferTime = time;

            var name =
                Match(text, @"([A-ZÁÉÍÓÚÑ\s]{8,})\s+DESTINATARIO") ??
                Match(text, @"DESTINATARIO:?\s*([A-ZÁÉÍÓÚÑ\s]+?)\s+MONTO\s+TRANSFERENCIA");

            info.DestinationName = CleanName(name);
        }

        private string? Match(string text, string pattern)
        {
            var match = Regex.Match(
                text,
                pattern,
                RegexOptions.Singleline | RegexOptions.IgnoreCase
            );

            return match.Success ? match.Groups[1].Value.Trim() : null;
        }

        private string? CleanName(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            return Regex.Replace(value, @"\s+", " ").Trim();
        }

        private decimal? ParseAmount(string value)
        {
            value = value.Trim();

            int lastDot = value.LastIndexOf('.');
            int lastComma = value.LastIndexOf(',');

            string normalized;

            if (lastDot > lastComma)
            {
                // Formato tipo 2,500.00
                normalized = value.Replace(",", "");
            }
            else if (lastComma > lastDot)
            {
                // Formato tipo 5.000,00
                normalized = value.Replace(".", "").Replace(",", ".");
            }
            else
            {
                normalized = value;
            }

            return decimal.TryParse(
                normalized,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out var amount
            ) ? amount : null;
        }

        private decimal? ExtractAmount(string text)
        {
            var patterns = new[]
            {
        // BCR
        @"MONTO\s+TRANSFERIDO\s+[¢₡£%]?\s*([\d\.,]+)",

        // Popular
        @"MONTO\s+DEBITADO\s+[¢₡£%]?\s*([\d\.,]+)",
        @"MONTO\s+DEPOSITADO\s+[¢₡£%]?\s*([\d\.,]+)",

        // BN: monto antes de la etiqueta
        @"([\d\.,]+)\s+COLONES\s+MONTO\s+TRANSFERENCIA",
        @"([\d\.,]+)\s+COLONES\s+MONTO\s+ACREDITADO",
        @"([\d\.,]+)\s+COLONES\s+MONTO\s+DEBITADO",

        // BN u otros: monto después de la etiqueta
        @"MONTO\s+TRANSFERENCIA:?\s+[¢₡£%]?\s*([\d\.,]+)",
        @"MONTO\s+ACREDITADO:?\s+[¢₡£%]?\s*([\d\.,]+)",
        @"MONTO\s+DEBITADO:?\s+[¢₡£%]?\s*([\d\.,]+)",

        // fallback general con símbolo
        @"[¢₡£%]\s*([\d\.,]+)"
    };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(
                    text,
                    pattern,
                    RegexOptions.IgnoreCase | RegexOptions.Singleline
                );

                if (match.Success)
                    return ParseAmount(match.Groups[1].Value);
            }

            return null;
        }

        private DateTime? ParseDate(string date)
        {
            return DateTime.TryParseExact(
                date,
                "dd/MM/yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var result
            ) ? result : null;
        }

        private DateTime? ParseSpanishDate(string date)
        {
            date = date
                .ToUpper()
                .Replace("DE ", "")
                .Replace(",", "")
                .Trim();

            var months = new Dictionary<string, string>
            {
                { "ENERO", "01" },
                { "FEBRERO", "02" },
                { "MARZO", "03" },
                { "ABRIL", "04" },
                { "MAYO", "05" },
                { "JUNIO", "06" },
                { "JULIO", "07" },
                { "AGOSTO", "08" },
                { "SETIEMBRE", "09" },
                { "SEPTIEMBRE", "09" },
                { "OCTUBRE", "10" },
                { "NOVIEMBRE", "11" },
                { "DICIEMBRE", "12" }
            };

            foreach (var month in months)
                date = date.Replace(month.Key, month.Value);

            return DateTime.TryParseExact(
                date,
                "dd MM yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var result
            ) ? result : null;
        }
    }
}