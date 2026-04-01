using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Payments
{
    public class OrderPaymentDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
