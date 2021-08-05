using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rhymess.Models;

namespace Rhymess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WordsController : ControllerBase
    {
        [HttpGet("{searchWord}")]
        public async Task<ActionResult<Word>> GetWord(string searchWord) {
            var word = new Word {
                word = searchWord,
                voicing = Data.GetPronunciation(searchWord)
            };

            return word;
        }
    }
}