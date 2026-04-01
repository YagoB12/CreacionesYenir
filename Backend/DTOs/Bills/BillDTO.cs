namespace backend_yenir.DTOs.Bills
{
    public class BillDTO
    {
        public int Id { get; set; }
        public string NumBill { get; set; } = null!;
        public string NameClient { get; set; } = null!;
        public string AddressClient { get; set; } = null!;
        public DateTime DateEmission { get; set; }
        public decimal TotalAmount { get; set; }
        public int Status { get; set; }

        public int ClientId { get; set; }
        public int PaymentId { get; set; }
    }
}
