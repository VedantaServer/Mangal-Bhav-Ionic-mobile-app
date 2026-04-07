using System;
namespace FaceUPAI.Models
{
	public class Message
	{
		#region Fields

		private int messageID;
		private int chatGroupID;
		private string chatType;
		private int senderID;
		private int receiverID;
		private string messageText;
		private string messageType;
		private string mediaURL;
		private DateTime sentAt;
		private bool isDeleted;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Message class.
		/// </summary>
		public Message()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Message class.
		/// </summary>
		public Message(int chatGroupID, string chatType, int senderID, int receiverID, string messageText, string messageType, string mediaURL, DateTime sentAt, bool isDeleted)
		{
			this.chatGroupID = chatGroupID;
			this.chatType = chatType;
			this.senderID = senderID;
			this.receiverID = receiverID;
			this.messageText = messageText;
			this.messageType = messageType;
			this.mediaURL = mediaURL;
			this.sentAt = sentAt;
			this.isDeleted = isDeleted;
		}

		/// <summary>
		/// Initializes a new instance of the Message class.
		/// </summary>
		public Message(int messageID, int chatGroupID, string chatType, int senderID, int receiverID, string messageText, string messageType, string mediaURL, DateTime sentAt, bool isDeleted)
		{
			this.messageID = messageID;
			this.chatGroupID = chatGroupID;
			this.chatType = chatType;
			this.senderID = senderID;
			this.receiverID = receiverID;
			this.messageText = messageText;
			this.messageType = messageType;
			this.mediaURL = mediaURL;
			this.sentAt = sentAt;
			this.isDeleted = isDeleted;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MessageID value.
		/// </summary>
		public  int MessageID
		{
			get { return messageID; }
			set { messageID = value; }
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
		/// Gets or sets the ChatType value.
		/// </summary>
		public  string ChatType
		{
			get { return chatType; }
			set { chatType = value; }
		}

		/// <summary>
		/// Gets or sets the SenderID value.
		/// </summary>
		public  int SenderID
		{
			get { return senderID; }
			set { senderID = value; }
		}

		/// <summary>
		/// Gets or sets the ReceiverID value.
		/// </summary>
		public  int ReceiverID
		{
			get { return receiverID; }
			set { receiverID = value; }
		}

		/// <summary>
		/// Gets or sets the MessageText value.
		/// </summary>
		public  string MessageText
		{
			get { return messageText; }
			set { messageText = value; }
		}

		/// <summary>
		/// Gets or sets the MessageType value.
		/// </summary>
		public  string MessageType
		{
			get { return messageType; }
			set { messageType = value; }
		}

		/// <summary>
		/// Gets or sets the MediaURL value.
		/// </summary>
		public  string MediaURL
		{
			get { return mediaURL; }
			set { mediaURL = value; }
		}

		/// <summary>
		/// Gets or sets the SentAt value.
		/// </summary>
		public  DateTime SentAt
		{
			get { return sentAt; }
			set { sentAt = value; }
		}

		/// <summary>
		/// Gets or sets the IsDeleted value.
		/// </summary>
		public  bool IsDeleted
		{
			get { return isDeleted; }
			set { isDeleted = value; }
		}

		#endregion
	}
}
