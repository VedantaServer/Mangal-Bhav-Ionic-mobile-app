using System;
namespace FaceUPAI.Models
{
	public class NotificationQueue
	{
		#region Fields

		private int iD;
		private int userID;
		private string title;
		private string message;
		private string notificationType;
		private DateTime createdDate;
		private DateTime sentDate;
		private bool isSent;
		private bool isSeen;
		private string firebaseResponse;
		private string errorMessage;
		private int referenceID;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the NotificationQueue class.
		/// </summary>
		public NotificationQueue()
		{
		}

		/// <summary>
		/// Initializes a new instance of the NotificationQueue class.
		/// </summary>
		public NotificationQueue(int userID, string title, string message, string notificationType, DateTime createdDate, DateTime sentDate, bool isSent, bool isSeen, string firebaseResponse, string errorMessage, int referenceID)
		{
			this.userID = userID;
			this.title = title;
			this.message = message;
			this.notificationType = notificationType;
			this.createdDate = createdDate;
			this.sentDate = sentDate;
			this.isSent = isSent;
			this.isSeen = isSeen;
			this.firebaseResponse = firebaseResponse;
			this.errorMessage = errorMessage;
			this.referenceID = referenceID;
		}

		/// <summary>
		/// Initializes a new instance of the NotificationQueue class.
		/// </summary>
		public NotificationQueue(int iD, int userID, string title, string message, string notificationType, DateTime createdDate, DateTime sentDate, bool isSent, bool isSeen, string firebaseResponse, string errorMessage, int referenceID)
		{
			this.iD = iD;
			this.userID = userID;
			this.title = title;
			this.message = message;
			this.notificationType = notificationType;
			this.createdDate = createdDate;
			this.sentDate = sentDate;
			this.isSent = isSent;
			this.isSeen = isSeen;
			this.firebaseResponse = firebaseResponse;
			this.errorMessage = errorMessage;
			this.referenceID = referenceID;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ID value.
		/// </summary>
		public  int ID
		{
			get { return iD; }
			set { iD = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the Title value.
		/// </summary>
		public  string Title
		{
			get { return title; }
			set { title = value; }
		}

		/// <summary>
		/// Gets or sets the Message value.
		/// </summary>
		public  string Message
		{
			get { return message; }
			set { message = value; }
		}

		/// <summary>
		/// Gets or sets the NotificationType value.
		/// </summary>
		public  string NotificationType
		{
			get { return notificationType; }
			set { notificationType = value; }
		}

		/// <summary>
		/// Gets or sets the CreatedDate value.
		/// </summary>
		public  DateTime CreatedDate
		{
			get { return createdDate; }
			set { createdDate = value; }
		}

		/// <summary>
		/// Gets or sets the SentDate value.
		/// </summary>
		public  DateTime SentDate
		{
			get { return sentDate; }
			set { sentDate = value; }
		}

		/// <summary>
		/// Gets or sets the IsSent value.
		/// </summary>
		public  bool IsSent
		{
			get { return isSent; }
			set { isSent = value; }
		}

		/// <summary>
		/// Gets or sets the IsSeen value.
		/// </summary>
		public  bool IsSeen
		{
			get { return isSeen; }
			set { isSeen = value; }
		}

		/// <summary>
		/// Gets or sets the FirebaseResponse value.
		/// </summary>
		public  string FirebaseResponse
		{
			get { return firebaseResponse; }
			set { firebaseResponse = value; }
		}

		/// <summary>
		/// Gets or sets the ErrorMessage value.
		/// </summary>
		public  string ErrorMessage
		{
			get { return errorMessage; }
			set { errorMessage = value; }
		}

		/// <summary>
		/// Gets or sets the ReferenceID value.
		/// </summary>
		public  int ReferenceID
		{
			get { return referenceID; }
			set { referenceID = value; }
		}

		#endregion
	}
}
