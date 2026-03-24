using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FaceUPAI.DataAccessService;
using FaceUPAI.Models;
using System.Data.SqlTypes;

namespace FaceUPAI.API
{
    public class GetMappedListDataAPI : Controller
    {
        public IActionResult index()
        {
            return View();
        }

    
      
    }
}
