namespace backend_yenir.Models
{
    public class PaymentSinpeInfo
    {
        public int Id { get; set; }

        public string Bank { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? TransferDate { get; set; }
        public string? TransferTime { get; set; }
        public string? DestinationName { get; set; }
        public string? DestinationPhone { get; set; }

        public string RawText { get; set; } = string.Empty;

        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;
    }
}