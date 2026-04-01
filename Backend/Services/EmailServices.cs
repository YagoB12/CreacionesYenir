using System.Net;
using System.Net.Mail;

namespace backend_yenir.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<(bool ok, string message)> SendAsync(
            string toEmail,
            string subject,
            string htmlBody
        ) => await SendAsync(toEmail, subject, htmlBody, null);

        public async Task<(bool ok, string message)> SendAsync(
            string toEmail,
            string subject,
            string htmlBody,
            (byte[] content, string fileName, string contentType)? attachment
        )
        {
            try
            {
                var host = _config["Smtp:Host"];
                var portStr = _config["Smtp:Port"];
                var user = _config["Smtp:User"];
                var pass = _config["Smtp:Pass"];
                var from = _config["Smtp:From"] ?? user;

                if (!int.TryParse(portStr, out var port))
                    return (false, "Puerto SMTP inválido (Smtp:Port).");

                using var smtp = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(user, pass),
                    EnableSsl = true,
                };

                using var mail = new MailMessage(from!, toEmail, subject, htmlBody)
                {
                    IsBodyHtml = true,
                };

                if (attachment.HasValue)
                {
                    var (content, fileName, contentType) = attachment.Value;
                    var ms = new MemoryStream(content);
                    var att = new Attachment(ms, fileName, contentType);
                    mail.Attachments.Add(att);
                }

                await smtp.SendMailAsync(mail);
                return (true, "Correo enviado correctamente.");
            }
            catch (Exception ex)
            {
                return (false, $"Error enviando correo: {ex.Message}");
            }
        }
    }
}
