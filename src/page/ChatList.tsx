import { getChatListFromServer, putConversationById } from 'api/conversationApi';
import { useEffect, useState } from 'react';
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
import { Keyboard } from 'react-native';
import { theme } from 'utils/colors';
import { Chat } from 'utils/type';

const DUMMUY_MY_ID = 'dummyMyId';

const style = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        backgroundColor: theme.bg,
        height: '100%',
    },
    chatView: {
        paddingHorizontal: 20,
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
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});

export default function ChatList({ route }: any) {
    const { conversationId } = route.params;
    const [emails, setEmails] = useState<Chat[]>([]);
    const [enteredText, setEnteredText] = useState<string>('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        getChatListFromServer(conversationId).then((emails) => setEmails(emails));
    }, [conversationId]);

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    return (
        <KeyboardAvoidingView
            style={style.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardHeight}
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
            <View style={[style.enterBox, { bottom: keyboardHeight }]}>
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
                        setEnteredText('');
                        getChatListFromServer(conversationId).then((emails) => setEmails(emails));
                    }}
                />
            </View>
        </KeyboardAvoidingView>
    );
}
