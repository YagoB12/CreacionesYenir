using System.ComponentModel.DataAnnotations;

namespace backend_yenir.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime DateEmission { get; set; }

        [Required]
        public int Status { get; set; }

        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;
    }
}
