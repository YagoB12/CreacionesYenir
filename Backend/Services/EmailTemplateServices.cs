namespace backend_yenir.Services
{
    public class EmailTemplateService
    {
        public string BuildPaymentStatusTemplate(
            string fullName,
            string billNumber,
            string estadoTexto,
            string estadoColor,
            string estadoFondo,
            decimal total,
            DateTime billDate,
            string mensajePrincipal,
            string adminContact
        )
        {
            return $@"
<div style='background:#f4f6f9; padding:30px 0; font-family: Arial, Helvetica, sans-serif;'>
  <div style='max-width:650px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);'>

    <div style='background:#111827; padding:20px 25px;'>
      <h2 style='margin:0; color:#ffffff;'>Creaciones Yenir</h2>
      <p style='margin:5px 0 0; color:#cbd5e1; font-size:13px;'>Notificación de verificación de pago</p>
    </div>

    <div style='padding:25px; color:#1f2937;'>

      <p style='font-size:15px; margin-bottom:15px;'>
        Hola <strong>{fullName}</strong>,
      </p>

      <div style='background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:18px;'>

        <p style='margin:0 0 8px;'>
          <strong>Número de factura:</strong> {billNumber}
        </p>

        <p style='margin:0 0 8px;'>
          <strong>Estado:</strong> 
          <span style='background:{estadoFondo}; color:{estadoColor}; padding:6px 12px; border-radius:999px; font-weight:bold; font-size:13px;'>
            {estadoTexto}
          </span>
        </p>

        <p style='margin:0 0 8px;'>
          <strong>Monto total:</strong> ₡{total:N2}
        </p>

        <p style='margin:0;'>
          <strong>Fecha de emisión:</strong> {billDate:yyyy-MM-dd HH:mm}
        </p>

      </div>

      <p style='margin-top:20px; font-size:14px;'>
        {mensajePrincipal}
      </p>

      <div style='margin-top:25px; padding-top:15px; border-top:1px solid #e5e7eb; font-size:13px; color:#374151;'>
        <strong>Contacto del administrador:</strong> 
        <a href='mailto:{adminContact}' style='color:#2563eb; text-decoration:none; font-weight:600;'>
          {adminContact}
        </a>
      </div>

    </div>

    <div style='background:#f9fafb; padding:15px 25px; text-align:center; font-size:12px; color:#6b7280;'>
      © {DateTime.UtcNow.Year} Creaciones Yenir - Documento generado automáticamente
    </div>

  </div>
</div>";
        }
    }
}
