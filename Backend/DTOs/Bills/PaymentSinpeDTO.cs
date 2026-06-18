namespace backend_yenir.DTOs.Bills
{
    public class PaymentSinpeInfoDTO
    {
        public string Bank { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public decimal? Amount { get; set; }

        public DateTime? TransferDate { get; set; }
        public string? TransferTime { get; set; }
        public string? DestinationName { get; set; }
        public string? DestinationPhone { get; set; }
    }
}
