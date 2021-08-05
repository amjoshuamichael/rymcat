using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Rhymess.Models {
    public class WordContext : DbContext {
        public WordContext(DbContextOptions<WordContext> options)
            : base(options) {
        }
        public DbSet<Word> Words { get; set; }
    }
}