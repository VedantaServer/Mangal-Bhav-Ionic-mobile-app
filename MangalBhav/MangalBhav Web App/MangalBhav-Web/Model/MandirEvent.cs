using System;
namespace FaceUPAI.Models
{
	public class MandirEvent
	{
		#region Fields

		private int mandirEventID;
		private int tenantID;
		private int mandirID;
		private string eventType;
		private string eventName;
		private string eventDescription;
		private string eventOrganizerName1;
		private string eventOrganizerName2;
		private string eventOrganizerPhone1;
		private string eventOrganizerPhone2;
		private string eventCardPhoto1;
		private string eventCardPhoto2;
		private string eventDate;
		private string eventTime;
		private string eventDay;
		private string eventStatus;
		private bool isVerified;
		private string adminRemarks;
		private int addedByMandirMemberID;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MandirEvent class.
		/// </summary>
		public MandirEvent()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MandirEvent class.
		/// </summary>
		public MandirEvent(int mandirEventID, int tenantID, int mandirID, string eventType, string eventName, string eventDescription, string eventOrganizerName1, string eventOrganizerName2, string eventOrganizerPhone1, string eventOrganizerPhone2, string eventCardPhoto1, string eventCardPhoto2, string eventDate, string eventTime, string eventDay, string eventStatus, bool isVerified, string adminRemarks, int addedByMandirMemberID, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.mandirEventID = mandirEventID;
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.eventType = eventType;
			this.eventName = eventName;
			this.eventDescription = eventDescription;
			this.eventOrganizerName1 = eventOrganizerName1;
			this.eventOrganizerName2 = eventOrganizerName2;
			this.eventOrganizerPhone1 = eventOrganizerPhone1;
			this.eventOrganizerPhone2 = eventOrganizerPhone2;
			this.eventCardPhoto1 = eventCardPhoto1;
			this.eventCardPhoto2 = eventCardPhoto2;
			this.eventDate = eventDate;
			this.eventTime = eventTime;
			this.eventDay = eventDay;
			this.eventStatus = eventStatus;
			this.isVerified = isVerified;
			this.adminRemarks = adminRemarks;
			this.addedByMandirMemberID = addedByMandirMemberID;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MandirEventID value.
		/// </summary>
		public  int MandirEventID
		{
			get { return mandirEventID; }
			set { mandirEventID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the MandirID value.
		/// </summary>
		public  int MandirID
		{
			get { return mandirID; }
			set { mandirID = value; }
		}

		/// <summary>
		/// Gets or sets the EventType value.
		/// </summary>
		public  string EventType
		{
			get { return eventType; }
			set { eventType = value; }
		}

		/// <summary>
		/// Gets or sets the EventName value.
		/// </summary>
		public  string EventName
		{
			get { return eventName; }
			set { eventName = value; }
		}

		/// <summary>
		/// Gets or sets the EventDescription value.
		/// </summary>
		public  string EventDescription
		{
			get { return eventDescription; }
			set { eventDescription = value; }
		}

		/// <summary>
		/// Gets or sets the EventOrganizerName1 value.
		/// </summary>
		public  string EventOrganizerName1
		{
			get { return eventOrganizerName1; }
			set { eventOrganizerName1 = value; }
		}

		/// <summary>
		/// Gets or sets the EventOrganizerName2 value.
		/// </summary>
		public  string EventOrganizerName2
		{
			get { return eventOrganizerName2; }
			set { eventOrganizerName2 = value; }
		}

		/// <summary>
		/// Gets or sets the EventOrganizerPhone1 value.
		/// </summary>
		public  string EventOrganizerPhone1
		{
			get { return eventOrganizerPhone1; }
			set { eventOrganizerPhone1 = value; }
		}

		/// <summary>
		/// Gets or sets the EventOrganizerPhone2 value.
		/// </summary>
		public  string EventOrganizerPhone2
		{
			get { return eventOrganizerPhone2; }
			set { eventOrganizerPhone2 = value; }
		}

		/// <summary>
		/// Gets or sets the EventCardPhoto1 value.
		/// </summary>
		public  string EventCardPhoto1
		{
			get { return eventCardPhoto1; }
			set { eventCardPhoto1 = value; }
		}

		/// <summary>
		/// Gets or sets the EventCardPhoto2 value.
		/// </summary>
		public  string EventCardPhoto2
		{
			get { return eventCardPhoto2; }
			set { eventCardPhoto2 = value; }
		}

		/// <summary>
		/// Gets or sets the EventDate value.
		/// </summary>
		public  string EventDate
		{
			get { return eventDate; }
			set { eventDate = value; }
		}

		/// <summary>
		/// Gets or sets the EventTime value.
		/// </summary>
		public  string EventTime
		{
			get { return eventTime; }
			set { eventTime = value; }
		}

		/// <summary>
		/// Gets or sets the EventDay value.
		/// </summary>
		public  string EventDay
		{
			get { return eventDay; }
			set { eventDay = value; }
		}

		/// <summary>
		/// Gets or sets the EventStatus value.
		/// </summary>
		public  string EventStatus
		{
			get { return eventStatus; }
			set { eventStatus = value; }
		}

		/// <summary>
		/// Gets or sets the IsVerified value.
		/// </summary>
		public  bool IsVerified
		{
			get { return isVerified; }
			set { isVerified = value; }
		}

		/// <summary>
		/// Gets or sets the AdminRemarks value.
		/// </summary>
		public  string AdminRemarks
		{
			get { return adminRemarks; }
			set { adminRemarks = value; }
		}

		/// <summary>
		/// Gets or sets the AddedByMandirMemberID value.
		/// </summary>
		public  int AddedByMandirMemberID
		{
			get { return addedByMandirMemberID; }
			set { addedByMandirMemberID = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
