using System;
namespace FaceUPAI.Models
{
	public class FeedShare
	{
		#region Fields

		private int feedShareID;
		private int feedID;
		private int userID;
		private string shareType;
		private DateTime sharedOn;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FeedShare class.
		/// </summary>
		public FeedShare()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FeedShare class.
		/// </summary>
		public FeedShare(int feedID, int userID, string shareType, DateTime sharedOn)
		{
			this.feedID = feedID;
			this.userID = userID;
			this.shareType = shareType;
			this.sharedOn = sharedOn;
		}

		/// <summary>
		/// Initializes a new instance of the FeedShare class.
		/// </summary>
		public FeedShare(int feedShareID, int feedID, int userID, string shareType, DateTime sharedOn)
		{
			this.feedShareID = feedShareID;
			this.feedID = feedID;
			this.userID = userID;
			this.shareType = shareType;
			this.sharedOn = sharedOn;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FeedShareID value.
		/// </summary>
		public  int FeedShareID
		{
			get { return feedShareID; }
			set { feedShareID = value; }
		}

		/// <summary>
		/// Gets or sets the FeedID value.
		/// </summary>
		public  int FeedID
		{
			get { return feedID; }
			set { feedID = value; }
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
		/// Gets or sets the ShareType value.
		/// </summary>
		public  string ShareType
		{
			get { return shareType; }
			set { shareType = value; }
		}

		/// <summary>
		/// Gets or sets the SharedOn value.
		/// </summary>
		public  DateTime SharedOn
		{
			get { return sharedOn; }
			set { sharedOn = value; }
		}

		#endregion
	}
}
