using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Bills
{
    public class BillCreateDTO
    {
        [Required]
        public int PaymentId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(50)]
        public string NumBill { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string NameClient { get; set; } = null!;

        [Required]
        [MaxLength(255)]
        public string AddressClient { get; set; } = null!;

        [Required]
        public DateTime DateEmission { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        public int Status { get; set; }
    }
}
