using System;
namespace FaceUPAI.Models
{
	public class ChatGroupParticipant
	{
		#region Fields

		private int chatGroupParticipantsID;
		private int chatGroupID;
		private int userID;
		private DateTime joinedAt;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ChatGroupParticipant class.
		/// </summary>
		public ChatGroupParticipant()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ChatGroupParticipant class.
		/// </summary>
		public ChatGroupParticipant(int chatGroupID, int userID, DateTime joinedAt)
		{
			this.chatGroupID = chatGroupID;
			this.userID = userID;
			this.joinedAt = joinedAt;
		}

		/// <summary>
		/// Initializes a new instance of the ChatGroupParticipant class.
		/// </summary>
		public ChatGroupParticipant(int chatGroupParticipantsID, int chatGroupID, int userID, DateTime joinedAt)
		{
			this.chatGroupParticipantsID = chatGroupParticipantsID;
			this.chatGroupID = chatGroupID;
			this.userID = userID;
			this.joinedAt = joinedAt;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ChatGroupParticipantsID value.
		/// </summary>
		public  int ChatGroupParticipantsID
		{
			get { return chatGroupParticipantsID; }
			set { chatGroupParticipantsID = value; }
		}

		/// <summary>
		/// Gets or sets the ChatGroupID value.
		/// </summary>
		public  int ChatGroupID
		{
			get { return chatGroupID; }
			set { chatGroupID = value; }
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
		/// Gets or sets the JoinedAt value.
		/// </summary>
		public  DateTime JoinedAt
		{
			get { return joinedAt; }
			set { joinedAt = value; }
		}

		#endregion
	}
}
