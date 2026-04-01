using System.ComponentModel.DataAnnotations;

namespace backend_yenir.Models
{
    public class Bill
    {
        [Key]
        public int Id { get; set; }

        // numBill
        [Required]
        [MaxLength(50)]
        public string NumBill { get; set; } = null!;

        // nameClient
        [Required]
        [MaxLength(150)]
        public string NameClient { get; set; } = null!;

        // addressClient
        [Required]
        [MaxLength(255)]
        public string AddressClient { get; set; } = null!;

        // dateEmision
        [Required]
        public DateTime DateEmission { get; set; }

        // totalMount
        [Required]
        public decimal TotalAmount { get; set; }

        // status
        [Required]
        public int Status { get; set; } //1.Pendeiente 2. Pago confirmadoo 3.Pago cancelado

        // id del cliente (User)
        [Required]
        public int ClientId { get; set; }
        public User Client { get; set; } = null!;

        // Relación 1-1 con Payment
        [Required]
        public int PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;
    }
}
