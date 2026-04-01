using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Reviews
{
    public class UpdateReviewDTO
    {
        [MaxLength(500)]
        public string? Comment { get; set; }

        [Range(1, 5)]
        public int? Calification { get; set; }
    }
}
