using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Inventory
{
    public class UpdateMaterialDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public int? Stock { get; set; }
    }
}
