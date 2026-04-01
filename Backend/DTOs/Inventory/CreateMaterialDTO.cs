using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Inventory
{
    public class CreateMaterialDTO
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public int Stock { get; set; }
    }
}
