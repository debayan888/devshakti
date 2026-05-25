/*
 * DevShakti OS — SDDM Login Theme
 * A macOS-inspired frosted glass login screen with light blue palette
 *
 * Compatible with SDDM + Qt 6 / Qt 5.15+
 */

import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import SddmComponents 2.0

Rectangle {
    id: root
    width: 1920
    height: 1080

    // ── Theme configuration ──
    readonly property color accentColor: "#4A9BD9"
    readonly property color accentHover: "#3A8EC8"
    readonly property color accentPressed: "#2D7AB5"
    readonly property color textPrimary: "#1A2A3A"
    readonly property color textSecondary: "#4A6A85"
    readonly property color textOnAccent: "#FFFFFF"
    readonly property color cardBackground: Qt.rgba(1, 1, 1, 0.55)
    readonly property color cardBorder: Qt.rgba(1, 1, 1, 0.35)
    readonly property color fieldBackground: Qt.rgba(1, 1, 1, 0.7)
    readonly property color fieldBorder: "#B3D4E6"
    readonly property color fieldFocusBorder: accentColor
    readonly property int cardRadius: 15
    readonly property string fontFamily: "Inter, Segoe UI, sans-serif"

    // ── Gradient background ──
    gradient: Gradient {
        GradientStop { position: 0.0; color: "#A8D0E6" }
        GradientStop { position: 0.5; color: "#B8D8EC" }
        GradientStop { position: 1.0; color: "#C5E1F0" }
    }

    // ── Subtle animated background circles for depth ──
    Repeater {
        model: 5
        Rectangle {
            id: bgCircle
            readonly property real baseX: Math.random() * root.width
            readonly property real baseY: Math.random() * root.height
            readonly property real circleSize: 200 + Math.random() * 400
            x: baseX - circleSize / 2
            y: baseY - circleSize / 2
            width: circleSize
            height: circleSize
            radius: circleSize / 2
            color: "transparent"
            border.color: Qt.rgba(1, 1, 1, 0.08 + Math.random() * 0.07)
            border.width: 1.5
            opacity: 0
            Component.onCompleted: fadeIn.start()
            NumberAnimation on opacity {
                id: fadeIn
                from: 0; to: 1
                duration: 1500 + index * 300
                easing.type: Easing.OutCubic
            }
        }
    }

    // ── Clock display (top-right) ──
    Column {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.topMargin: 40
        anchors.rightMargin: 50
        spacing: 4
        opacity: 0
        Component.onCompleted: clockFade.start()
        NumberAnimation on opacity {
            id: clockFade
            from: 0; to: 1
            duration: 1200
            easing.type: Easing.OutCubic
        }

        Text {
            id: timeLabel
            anchors.right: parent.right
            font.family: root.fontFamily
            font.pixelSize: 52
            font.weight: Font.Light
            color: root.textPrimary
            function updateTime() {
                var d = new Date();
                var h = d.getHours();
                var m = d.getMinutes();
                text = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
            }
            Component.onCompleted: updateTime()
        }

        Text {
            id: dateLabel
            anchors.right: parent.right
            font.family: root.fontFamily
            font.pixelSize: 16
            font.weight: Font.Normal
            color: root.textSecondary
            function updateDate() {
                var d = new Date();
                var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                var months = ["January","February","March","April","May","June",
                              "July","August","September","October","November","December"];
                text = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
            }
            Component.onCompleted: updateDate()
        }
    }

    Timer {
        interval: 30000
        running: true
        repeat: true
        onTriggered: {
            timeLabel.updateTime();
            dateLabel.updateDate();
        }
    }

    // ── Login card ──
    Rectangle {
        id: loginCard
        anchors.centerIn: parent
        width: 420
        height: cardContent.implicitHeight + 80
        radius: root.cardRadius
        color: root.cardBackground
        border.color: root.cardBorder
        border.width: 1

        // Drop shadow simulation
        Rectangle {
            anchors.fill: parent
            anchors.margins: -1
            z: -1
            radius: root.cardRadius + 1
            color: Qt.rgba(0, 0, 0, 0.08)
            anchors.topMargin: 4
            anchors.leftMargin: 2
            anchors.rightMargin: -2
            anchors.bottomMargin: -4
        }

        // Card entrance animation
        opacity: 0
        scale: 0.95
        Component.onCompleted: {
            cardFadeIn.start();
            cardScaleIn.start();
        }
        NumberAnimation on opacity {
            id: cardFadeIn
            from: 0; to: 1; duration: 800
            easing.type: Easing.OutCubic
        }
        NumberAnimation on scale {
            id: cardScaleIn
            from: 0.95; to: 1.0; duration: 800
            easing.type: Easing.OutBack
            properties: "scale"
        }

        ColumnLayout {
            id: cardContent
            anchors.fill: parent
            anchors.margins: 40
            spacing: 20

            // ── Brand ──
            Column {
                Layout.alignment: Qt.AlignHCenter
                spacing: 6

                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "DevShakti"
                    font.family: root.fontFamily
                    font.pixelSize: 32
                    font.weight: Font.Bold
                    color: root.accentColor
                }
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Welcome back"
                    font.family: root.fontFamily
                    font.pixelSize: 14
                    font.weight: Font.Normal
                    color: root.textSecondary
                }
            }

            // ── User avatar ──
            Rectangle {
                Layout.alignment: Qt.AlignHCenter
                width: 80; height: 80
                radius: 40
                color: root.accentColor
                border.color: Qt.rgba(1, 1, 1, 0.4)
                border.width: 2

                Text {
                    anchors.centerIn: parent
                    text: "\u{1F464}"
                    font.pixelSize: 36
                    color: root.textOnAccent
                }
            }

            // ── Username field ──
            Rectangle {
                Layout.fillWidth: true
                height: 48
                radius: 10
                color: root.fieldBackground
                border.color: usernameField.activeFocus ? root.fieldFocusBorder : root.fieldBorder
                border.width: usernameField.activeFocus ? 2 : 1

                Behavior on border.color {
                    ColorAnimation { duration: 200 }
                }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 16
                    anchors.rightMargin: 16
                    spacing: 10

                    Text {
                        text: "\u{1F464}"
                        font.pixelSize: 16
                        color: root.textSecondary
                        Layout.alignment: Qt.AlignVCenter
                    }

                    TextInput {
                        id: usernameField
                        Layout.fillWidth: true
                        Layout.alignment: Qt.AlignVCenter
                        font.family: root.fontFamily
                        font.pixelSize: 14
                        color: root.textPrimary
                        clip: true
                        selectByMouse: true
                        KeyNavigation.tab: passwordField

                        Text {
                            anchors.fill: parent
                            anchors.verticalCenter: parent.verticalCenter
                            text: "Username"
                            font.family: root.fontFamily
                            font.pixelSize: 14
                            color: root.textSecondary
                            visible: !usernameField.text && !usernameField.activeFocus
                            verticalAlignment: Text.AlignVCenter
                        }
                    }
                }
            }

            // ── Password field ──
            Rectangle {
                Layout.fillWidth: true
                height: 48
                radius: 10
                color: root.fieldBackground
                border.color: passwordField.activeFocus ? root.fieldFocusBorder : root.fieldBorder
                border.width: passwordField.activeFocus ? 2 : 1

                Behavior on border.color {
                    ColorAnimation { duration: 200 }
                }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 16
                    anchors.rightMargin: 16
                    spacing: 10

                    Text {
                        text: "\uD83D\uDD12"
                        font.pixelSize: 16
                        color: root.textSecondary
                        Layout.alignment: Qt.AlignVCenter
                    }

                    TextInput {
                        id: passwordField
                        Layout.fillWidth: true
                        Layout.alignment: Qt.AlignVCenter
                        font.family: root.fontFamily
                        font.pixelSize: 14
                        color: root.textPrimary
                        echoMode: TextInput.Password
                        clip: true
                        selectByMouse: true
                        KeyNavigation.tab: loginButton

                        Keys.onReturnPressed: doLogin()
                        Keys.onEnterPressed: doLogin()

                        Text {
                            anchors.fill: parent
                            anchors.verticalCenter: parent.verticalCenter
                            text: "Password"
                            font.family: root.fontFamily
                            font.pixelSize: 14
                            color: root.textSecondary
                            visible: !passwordField.text && !passwordField.activeFocus
                            verticalAlignment: Text.AlignVCenter
                        }
                    }
                }
            }

            // ── Error message ──
            Text {
                id: errorMessage
                Layout.fillWidth: true
                Layout.alignment: Qt.AlignHCenter
                horizontalAlignment: Text.AlignHCenter
                font.family: root.fontFamily
                font.pixelSize: 12
                color: "#DA4453"
                text: ""
                visible: text !== ""
                opacity: visible ? 1.0 : 0.0
                Behavior on opacity {
                    NumberAnimation { duration: 300 }
                }
            }

            // ── Login button ──
            Rectangle {
                id: loginButton
                Layout.fillWidth: true
                height: 48
                radius: 10
                color: loginMouseArea.containsPress ? root.accentPressed
                     : loginMouseArea.containsMouse ? root.accentHover
                     : root.accentColor

                Behavior on color {
                    ColorAnimation { duration: 150 }
                }

                scale: loginMouseArea.containsPress ? 0.97 : 1.0
                Behavior on scale {
                    NumberAnimation { duration: 100; easing.type: Easing.OutCubic }
                }

                Text {
                    anchors.centerIn: parent
                    text: "Sign In"
                    font.family: root.fontFamily
                    font.pixelSize: 16
                    font.weight: Font.DemiBold
                    color: root.textOnAccent
                }

                MouseArea {
                    id: loginMouseArea
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: doLogin()
                }
            }

            // ── Session selector ──
            RowLayout {
                Layout.alignment: Qt.AlignHCenter
                spacing: 8

                Text {
                    text: "Session:"
                    font.family: root.fontFamily
                    font.pixelSize: 12
                    color: root.textSecondary
                }

                ComboBox {
                    id: sessionSelector
                    model: sessionModel
                    textRole: "name"
                    currentIndex: sessionModel.lastIndex
                    font.family: root.fontFamily
                    font.pixelSize: 12
                    implicitWidth: 180

                    background: Rectangle {
                        radius: 8
                        color: root.fieldBackground
                        border.color: root.fieldBorder
                        border.width: 1
                    }
                }
            }
        }
    }

    // ── Power buttons (bottom-right) ──
    Row {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.bottomMargin: 30
        anchors.rightMargin: 40
        spacing: 16
        opacity: 0
        Component.onCompleted: powerFade.start()
        NumberAnimation on opacity {
            id: powerFade
            from: 0; to: 1; duration: 1500
            easing.type: Easing.OutCubic
        }

        // Suspend button
        Rectangle {
            width: 44; height: 44
            radius: 22
            color: suspendMa.containsMouse ? Qt.rgba(1,1,1,0.5) : Qt.rgba(1,1,1,0.25)
            Behavior on color { ColorAnimation { duration: 200 } }
            visible: sddm.canSuspend
            Text {
                anchors.centerIn: parent
                text: "\u{23F8}"
                font.pixelSize: 20
                color: root.textPrimary
            }
            MouseArea {
                id: suspendMa
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: sddm.suspend()
            }
        }

        // Reboot button
        Rectangle {
            width: 44; height: 44
            radius: 22
            color: rebootMa.containsMouse ? Qt.rgba(1,1,1,0.5) : Qt.rgba(1,1,1,0.25)
            Behavior on color { ColorAnimation { duration: 200 } }
            visible: sddm.canReboot
            Text {
                anchors.centerIn: parent
                text: "\u{1F504}"
                font.pixelSize: 20
                color: root.textPrimary
            }
            MouseArea {
                id: rebootMa
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: sddm.reboot()
            }
        }

        // Power off button
        Rectangle {
            width: 44; height: 44
            radius: 22
            color: powerMa.containsMouse ? Qt.rgba(0.85,0.27,0.33,0.6) : Qt.rgba(1,1,1,0.25)
            Behavior on color { ColorAnimation { duration: 200 } }
            visible: sddm.canPowerOff
            Text {
                anchors.centerIn: parent
                text: "\u{23FB}"
                font.pixelSize: 22
                color: powerMa.containsMouse ? "#FFFFFF" : root.textPrimary
            }
            MouseArea {
                id: powerMa
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: sddm.powerOff()
            }
        }
    }

    // ── Hostname (bottom-left) ──
    Text {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.bottomMargin: 35
        anchors.leftMargin: 40
        text: sddm.hostName
        font.family: root.fontFamily
        font.pixelSize: 13
        color: root.textSecondary
        opacity: 0.8
    }

    // ── Login logic ──
    function doLogin() {
        errorMessage.text = "";
        if (usernameField.text === "") {
            errorMessage.text = "Please enter a username";
            return;
        }
        if (passwordField.text === "") {
            errorMessage.text = "Please enter a password";
            return;
        }
        sddm.login(usernameField.text, passwordField.text, sessionSelector.currentIndex);
    }

    // ── Handle login failure ──
    Connections {
        target: sddm
        function onLoginFailed() {
            errorMessage.text = "Login failed. Please try again.";
            passwordField.text = "";
            passwordField.focus = true;

            // Shake animation on error
            shakeAnimation.start();
        }
    }

    SequentialAnimation {
        id: shakeAnimation
        NumberAnimation { target: loginCard; property: "x"; to: loginCard.x - 10; duration: 50 }
        NumberAnimation { target: loginCard; property: "x"; to: loginCard.x + 10; duration: 50 }
        NumberAnimation { target: loginCard; property: "x"; to: loginCard.x - 6; duration: 50 }
        NumberAnimation { target: loginCard; property: "x"; to: loginCard.x + 6; duration: 50 }
        NumberAnimation { target: loginCard; property: "x"; to: loginCard.x; duration: 50 }
    }

    // ── Focus username on load ──
    Component.onCompleted: {
        usernameField.focus = true;
    }
}
