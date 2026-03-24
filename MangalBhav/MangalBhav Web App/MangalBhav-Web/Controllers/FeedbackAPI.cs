using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class FeedbackAPI : ControllerBase
	{
	public IActionResult Index()
	{
	return View();
	}
	private IActionResult View()
	{
	throw new NotImplementedException();
	}
		/// <summary>
		/// Saves a record to the Feedback table.
		/// </summary>
		[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FeedbackInsert")]
		public IActionResult FeedbackInsert([FromBody] Feedback feedback)
		{
			return ApiHandler.Handle(() =>
			{

				SqlParameter[] parameters = new SqlParameter[]
				{
			new SqlParameter("@TenantID", feedback.TenantID == 0 ? SqlInt32.Null : feedback.TenantID),
			new SqlParameter("@BookingID", feedback.BookingID == 0 ? SqlInt32.Null : feedback.BookingID),
			new SqlParameter("@Ratings", feedback.Ratings == 0 ? SqlInt32.Null : feedback.Ratings),
			new SqlParameter("@Description", feedback.Description),
			new SqlParameter("@DateAdded", feedback.DateAdded == DateTime.MinValue ? SqlDateTime.Null : feedback.DateAdded),
			new SqlParameter("@DateModified", feedback.DateModified == DateTime.MinValue ? SqlDateTime.Null : feedback.DateModified),
			new SqlParameter("@UpdatedByUser", feedback.UpdatedByUser)
				};

				return Ok(DataAccess.ExecuteNonQuery(
					System.Data.CommandType.StoredProcedure,
					"FeedbackInsert",
					parameters
				));

			}, this);
		}

		/// <summary>
		/// Selects all query records from the Feedback table by a ak=ll query.
		/// </summary>
		[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FeedbackSelectByQuery")]
		public  IActionResult FeedbackSelectByQuery(string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
								new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedbackSelectByQuery", parameters))
			{
				List<Feedback> FeedbackList = new List<Feedback>();
				while (dataReader.Read())
				{
					Feedback Feedback = MakeFeedback(dataReader);
					FeedbackList.Add(Feedback);
				}

				return  Ok(new {FeedbackList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Feedback class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Feedback MakeFeedback(SqlDataReader dataReader)
		{
			Feedback feedback = new Feedback();
			feedback.FeedbackID = DataAccess.GetInt32(dataReader, "feedbackID", 0);
			feedback.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			feedback.BookingID = DataAccess.GetInt32(dataReader, "BookingID", 0);
			feedback.Ratings = DataAccess.GetInt32(dataReader, "Ratings", 0);
			feedback.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			feedback.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			feedback.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			feedback.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return feedback;
		}

	}
	}
