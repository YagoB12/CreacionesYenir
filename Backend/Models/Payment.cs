using System.ComponentModel.DataAnnotations;

namespace backend_yenir.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime DateCreate { get; set; } = DateTime.UtcNow;

        [Required]
        public int status { get; set; }

        [Required]
        public decimal TotalPrice { get; set; }

        [MaxLength(255)]
        public string? Img { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

        public Bill? Bill { get; set; }

        // Relación 1:1
        public Order Order { get; set; } = null!;
    }
}
