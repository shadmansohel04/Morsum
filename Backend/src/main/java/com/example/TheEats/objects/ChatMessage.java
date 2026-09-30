package com.example.TheEats.objects;

public class ChatMessage {

    private String content;
    private String sender;
    private MessageType type;
    private String roomID;

    private ChatMessage(String content, String sender, MessageType type, String roomID) {
        this.content = content;
        this.sender = sender;
        this.type = type;
        this.roomID = roomID;
    }

    public String getContent() {
        return this.content;
    }

    public String getSender() {
        return this.sender;
    }

    public MessageType getMessageType() {
        return this.type;
    }
    
    public String getRoomID(){
        return this.roomID;
    }

    public static class Builder {
        private String content;
        private String sender;
        private MessageType type;
        private String roomID;

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder sender(String sender) {
            this.sender = sender;
            return this;
        }
        
        public Builder type(MessageType type) {
            this.type = type;
            return this;
        }

        public ChatMessage build() {
            return new ChatMessage(content, sender, type, roomID);
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
