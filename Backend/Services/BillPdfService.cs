using backend_yenir.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend_yenir.Services
{
    public class BillPdfService
    {
        public byte[] GenerateBillPdf(
            Bill bill,
            Payment payment,
            IEnumerable<OrderDetail> details,
            string adminContact,
            string estadoTexto
        )
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var estadoColor =
                estadoTexto == "Pago confirmado" ? Colors.Green.Medium : Colors.Red.Medium;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);

                    page.Header()
                        .Column(header =>
                        {
                            header
                                .Item()
                                .Background("#0f172a")
                                .Padding(15)
                                .Row(row =>
                                {
                                    row.RelativeColumn()
                                        .Column(col =>
                                        {
                                            col.Item()
                                                .Text("CREACIONES YENIR")
                                                .FontSize(18)
                                                .Bold()
                                                .FontColor(Colors.White);

                                            col.Item()
                                                .Text("Factura / Comprobante de pago")
                                                .FontSize(12)
                                                .FontColor(Colors.White);
                                        });

                                    row.ConstantColumn(220)
                                        .AlignRight()
                                        .Column(col =>
                                        {
                                            col.Item()
                                                .Text($"Factura: {bill.NumBill}")
                                                .FontColor(Colors.White)
                                                .SemiBold();

                                            col.Item()
                                                .Text($"Estado: {estadoTexto}")
                                                .FontColor(estadoColor);

                                            col.Item()
                                                .Text($"{bill.DateEmission:yyyy-MM-dd HH:mm}")
                                                .FontColor(Colors.White);
                                        });
                                });

                            header.Item().Height(6).Background("#1e293b");
                        });
                    page.Content()
                        .PaddingTop(20)
                        .Column(column =>
                        {
                            // DATOS CLIENTE
                            column
                                .Item()
                                .Background(Colors.Grey.Lighten4)
                                .Padding(15)
                                .Column(col =>
                                {
                                    col.Item().Text("Datos del Cliente").FontSize(14).SemiBold();
                                    col.Item().Text($"Nombre: {bill.NameClient}");
                                    col.Item().Text($"Dirección: {bill.AddressClient}");
                                });

                            column.Item().PaddingTop(20);

                            column
                                .Item()
                                .Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(4);
                                        columns.RelativeColumn(1.4f);
                                        columns.RelativeColumn(2);
                                        columns.RelativeColumn(2);
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellHeader).Text("Producto");
                                        header
                                            .Cell()
                                            .Element(CellHeader)
                                            .AlignRight()
                                            .Text("Cantidad");
                                        header
                                            .Cell()
                                            .Element(CellHeader)
                                            .AlignRight()
                                            .Text("Precio Unitario");
                                        header
                                            .Cell()
                                            .Element(CellHeader)
                                            .AlignRight()
                                            .Text("Total");
                                    });

                                    foreach (var d in details)
                                    {
                                        table.Cell().Element(CellBody).Text(d.Product?.Name ?? "");
                                        table
                                            .Cell()
                                            .Element(CellBody)
                                            .AlignRight()
                                            .Text(d.Quantity.ToString());
                                        table
                                            .Cell()
                                            .Element(CellBody)
                                            .AlignRight()
                                            .Text($"₡{d.UnitePrice:N2}");
                                        table
                                            .Cell()
                                            .Element(CellBody)
                                            .AlignRight()
                                            .Text($"₡{d.TotalPrice:N2}");
                                    }

                                    static IContainer CellHeader(IContainer c) =>
                                        c.Border(1)
                                            .BorderColor("#0f172a")
                                            .Background("#0f172a")
                                            .Padding(6)
                                            .DefaultTextStyle(x =>
                                                x.SemiBold().FontColor(Colors.White)
                                            );

                                    static IContainer CellBody(IContainer c) =>
                                        c.Border(1).BorderColor("#0f172a").Padding(6);
                                });

                            column.Item().PaddingTop(15);

                            // TOTAL
                            column
                                .Item()
                                .AlignRight()
                                .Text($"Total: ₡{bill.TotalAmount:N2}")
                                .FontSize(14)
                                .Bold();

                            column.Item().PaddingTop(20);

                            // MENSAJE
                            column
                                .Item()
                                .Text(
                                    estadoTexto == "Pago confirmado"
                                        ? "Tu compra fue aceptada satisfactoriamente."
                                        : "El comprobante de pago no fue válido. Comunícate con el administrador."
                                );

                            column.Item().PaddingTop(10);

                            column.Item().Text($"Contacto administrador: {adminContact}");
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Documento generado automáticamente - ");
                            text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")).SemiBold();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
