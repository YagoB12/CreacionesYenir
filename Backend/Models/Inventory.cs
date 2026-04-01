using System.ComponentModel.DataAnnotations;

namespace backend_yenir.Models
{
    public class Inventory
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        public int Stock { get; set; }
    }
}
