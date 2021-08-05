using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Rhymess.Models {
    public class Word {
        [Key] public string word { get; set; } // The word that we are finding a voicing for.
        [Key] public string voicing { get; set; } // The voicing itself.
    }
}
