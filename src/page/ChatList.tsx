import { getChatListFromServer, putConversationById } from 'api/conversationApi';
import { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { theme } from 'utils/colors';
import { Chat } from 'utils/type';
import { LoremIpsum } from 'lorem-ipsum';

const DUMMUY_MY_ID = 'dummyMyId';

const style = StyleSheet.create({
    container: {
        position: 'relative',
        backgroundColor: theme.bg,
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    chatView: {
        paddingHorizontal: 20,
        backgroundColor: 'yellow',
    },
    chatContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    chatBox: {
        maxWidth: 250,
        padding: 20,
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    text: {
        color: theme.grey,
    },
    userName: {
        fontWeight: 'bold',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    enterBox: {
        width: '100%',
        height: 70,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});

export default function ChatList({ route }: any) {
    const { conversationId, userId, userName, userAvatarUrl } = route.params;
    const [emails, setEmails] = useState<Chat[]>([]);
    const [enteredText, setEnteredText] = useState<string>('');

    const handleResponse = useCallback(() => {
        setTimeout(() => {
            const lorem = new LoremIpsum({
                sentencesPerParagraph: {
                    max: 8,
                    min: 4,
                },
                wordsPerSentence: {
                    max: 16,
                    min: 4,
                },
            });
            const resSentence = lorem.generateSentences(3);
            putConversationById({
                conversationId,
                text: resSentence,
                userId,
                userName,
                userAvatarUrl,
            });
            getChatListFromServer(conversationId).then((emails) => setEmails(emails));
        }, Math.floor(Math.random() * 3000));
    }, [conversationId, userId, userName, userAvatarUrl]);

    useEffect(() => {
        getChatListFromServer(conversationId).then((emails) => setEmails(emails));
    }, [conversationId]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={style.container}
            keyboardVerticalOffset={90}
        >
            <ScrollView style={style.chatView}>
                {emails.map((email) => (
                    <View
                        key={email.id}
                        style={{
                            ...style.chatContainer,
                            justifyContent:
                                email.userId === DUMMUY_MY_ID ? 'flex-end' : 'flex-start',
                        }}
                    >
                        {email.userId !== DUMMUY_MY_ID && (
                            <View>
                                <Image
                                    style={style.image}
                                    source={{ uri: email.userAvatarUrl }}
                                ></Image>
                            </View>
                        )}
                        <View>
                            {email.userId !== DUMMUY_MY_ID && (
                                <Text style={style.userName}>{email.userName}</Text>
                            )}
                            <View style={style.chatBox}>
                                <Text style={style.text}>{email.text}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={style.enterBox}>
                <TextInput
                    placeholder="Enter text here"
                    value={enteredText}
                    onChangeText={(text) => setEnteredText(text)}
                ></TextInput>
                <Button
                    title="Send"
                    onPress={() => {
                        if (enteredText === '') return;
                        putConversationById({ conversationId, text: enteredText });
                        handleResponse();
                        setEnteredText('');
                        getChatListFromServer(conversationId).then((emails) => setEmails(emails));
                    }}
                />
            </View>
        </KeyboardAvoidingView>
    );
}
