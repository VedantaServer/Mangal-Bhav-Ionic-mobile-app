using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class BookingAPI : ControllerBase
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
		/// Saves a record to the Bookings table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsInsert")]
		public  IActionResult BookingsInsert([FromBody] Booking booking)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", booking.TenantID == 0 ? SqlInt32.Null : booking.TenantID ),
				new SqlParameter("@PanditServiceID", booking.PanditServiceID == 0 ? SqlInt32.Null : booking.PanditServiceID ),
				new SqlParameter("@BhaktProfileID", booking.BhaktProfileID == 0 ? SqlInt32.Null : booking.BhaktProfileID ),
				new SqlParameter("@Status", booking.Status),
				new SqlParameter("@TotalAmount", booking.TotalAmount),
				new SqlParameter("@PaymentStatus", booking.PaymentStatus),
				new SqlParameter("@PoojaDate", booking.PoojaDate == DateTime.MinValue ? SqlDateTime.Null : booking.PoojaDate ),
				new SqlParameter("@DateAdded", booking.DateAdded == DateTime.MinValue ? SqlDateTime.Null : booking.DateAdded ),
				new SqlParameter("@DateModified", booking.DateModified == DateTime.MinValue ? SqlDateTime.Null : booking.DateModified ),
				new SqlParameter("@UpdatedByUser", booking.UpdatedByUser)
			};

			booking.BookingID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "BookingsInsert", parameters));
			return Ok(new {BookingID=booking.BookingID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Bookings table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsUpdate")]
		public  IActionResult BookingsUpdate([FromBody] Booking booking)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BookingID", booking.BookingID == 0 ? SqlInt32.Null : booking.BookingID ),
				new SqlParameter("@TenantID", booking.TenantID == 0 ? SqlInt32.Null : booking.TenantID ),
				new SqlParameter("@PanditServiceID", booking.PanditServiceID == 0 ? SqlInt32.Null : booking.PanditServiceID ),
				new SqlParameter("@BhaktProfileID", booking.BhaktProfileID == 0 ? SqlInt32.Null : booking.BhaktProfileID ),
				new SqlParameter("@Status", booking.Status),
				new SqlParameter("@TotalAmount", booking.TotalAmount),
				new SqlParameter("@PaymentStatus", booking.PaymentStatus),
				new SqlParameter("@PoojaDate", booking.PoojaDate == DateTime.MinValue ? SqlDateTime.Null : booking.PoojaDate ),
				new SqlParameter("@DateAdded", booking.DateAdded == DateTime.MinValue ? SqlDateTime.Null : booking.DateAdded ),
				new SqlParameter("@DateModified", booking.DateModified == DateTime.MinValue ? SqlDateTime.Null : booking.DateModified ),
				new SqlParameter("@UpdatedByUser", booking.UpdatedByUser)
			};

			 var BookingID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "BookingsUpdate", parameters));
			return Ok(new {BookingID =BookingID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Bookings table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsDelete")]
		public  IActionResult BookingsDelete(int bookingID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BookingID", bookingID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var bookingsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "BookingsDelete", parameters));
			return Ok(new {BookingsID =bookingsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Bookings table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingSelect")]
		public IActionResult BookingSelect(int bookingID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@BookingID", bookingID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "BookingsSelect", parameters))
			{
				List<Booking> BookingList = new List<Booking>();
				while (dataReader.Read())
				{
					Booking Booking = MakeBooking(dataReader);
					BookingList.Add(Booking);
				}

				return  Ok(new {BookingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Bookings table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingSelectAll")]
		public IActionResult BookingSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "BookingsSelectAll", parameters))
			{
				List<Booking> BookingList = new List<Booking>();
				while (dataReader.Read())
				{
					Booking Booking = MakeBooking(dataReader);
					BookingList.Add(Booking);
				}

				return  Ok(new {BookingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Bookings table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsSelectAllByPanditServiceID")]
		public  IActionResult BookingsSelectAllByPanditServiceID(int panditServiceID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PanditServiceID", panditServiceID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "BookingsSelectAllByPanditServiceID", parameters))
			{
				List<Booking> BookingList = new List<Booking>();
				while (dataReader.Read())
				{
					Booking Booking = MakeBooking(dataReader);
					BookingList.Add(Booking);
				}

				return  Ok(new {BookingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Bookings table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsSelectAllByTenantID")]
		public  IActionResult BookingsSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "BookingsSelectAllByTenantID", parameters))
			{
				List<Booking> BookingList = new List<Booking>();
				while (dataReader.Read())
				{
					Booking Booking = MakeBooking(dataReader);
					BookingList.Add(Booking);
				}

				return  Ok(new {BookingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Bookings table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("BookingsSelectByQuery")]
		public  IActionResult BookingsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "BookingsSelectByQuery", parameters))
			{
				List<Booking> BookingList = new List<Booking>();
				while (dataReader.Read())
				{
					Booking Booking = MakeBooking(dataReader);
					BookingList.Add(Booking);
				}

				return  Ok(new {BookingList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Bookings class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Booking MakeBooking(SqlDataReader dataReader)
		{
			Booking booking = new Booking();
			booking.BookingID = DataAccess.GetInt32(dataReader, "BookingID", 0);
			booking.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			booking.PanditServiceID = DataAccess.GetInt32(dataReader, "PanditServiceID", 0);
			booking.BhaktProfileID = DataAccess.GetInt32(dataReader, "BhaktProfileID", 0);
			booking.Status = DataAccess.GetString(dataReader, "Status", String.Empty);
			booking.TotalAmount = DataAccess.GetDecimal(dataReader, "TotalAmount", Decimal.Zero);
			booking.PaymentStatus = DataAccess.GetString(dataReader, "PaymentStatus", String.Empty);
			booking.PoojaDate = DataAccess.GetDateTime(dataReader, "PoojaDate", DateTime.MinValue);
			booking.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			booking.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			booking.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return booking;
		}

	}
	}
