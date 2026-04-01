using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_yenir.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required, MaxLength(500)]
        public string Comment { get; set; } = null!;

        [Required, Range(1, 5)]
        public int Calification { get; set; }

        [Required]
        public DateTime DateCreate { get; set; } = DateTime.UtcNow;

        // Relaciones
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
