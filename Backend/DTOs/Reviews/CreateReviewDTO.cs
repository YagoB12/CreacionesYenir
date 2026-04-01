using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Reviews
{
    public class CreateReviewDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required, MaxLength(500)]
        public string Comment { get; set; } = null!;

        [Required, Range(1, 5)]
        public int Calification { get; set; }
    }
}
