import 'package:flutter/material.dart';
import 'package:bip39/bip39.dart' as bip39;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert'; // For base64 encoding
import 'package:lottie/lottie.dart';  // Import Lottie package

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Bittensor Wallet',
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.tealAccent[700],
        colorScheme: ColorScheme.fromSwatch().copyWith(secondary: Colors.tealAccent),
        scaffoldBackgroundColor: Colors.black,
        textTheme: TextTheme(
          headlineLarge: TextStyle(
              fontSize: 32.0, fontWeight: FontWeight.bold, color: Colors.white),
          bodyLarge: TextStyle(fontSize: 16.0, color: Colors.white70),
        ),
      ),
      home: LoaderScreen(),  // Start with the loader screen
    );
  }
}

class LoaderScreen extends StatefulWidget {
  @override
  _LoaderScreenState createState() => _LoaderScreenState();
}

class _LoaderScreenState extends State<LoaderScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToHomeScreen();
  }

  void _navigateToHomeScreen() {
    // Navigate to HomeScreen after the animation or delay
    Future.delayed(Duration(seconds: 2), () {
      Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => HomeScreen()));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Lottie.asset(
          'assets/CrucibleAnimation.json',  // Path to the animation file
          width: 500,
          height: 180,
          fit: BoxFit.fill,
        ),
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final storage = FlutterSecureStorage();
  bool hasWallet = false;

  @override
  void initState() {
    super.initState();
    _checkForExistingWallet();
  }

  // Check if a wallet already exists in secure storage
  void _checkForExistingWallet() async {
    String? mnemonic = await storage.read(key: 'wallet_mnemonic');
    if (mnemonic != null) {
      setState(() {
        hasWallet = true; // Wallet exists
      });
      _navigateToMnemonicScreen(mnemonic);  // Navigate to mnemonic screen if wallet exists
    } else {
      setState(() {
        hasWallet = false; // No wallet exists
      });
    }
  }

  // Navigate to the screen that displays the mnemonic
  void _navigateToMnemonicScreen(String mnemonic) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => DisplayMnemonicScreen(mnemonic: mnemonic)),
    );
  }

  // Navigate to create wallet page
  void _navigateToCreateWallet() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => WalletCreation()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Crucible Tao Wallet'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Center(
        child: hasWallet
            ? CircularProgressIndicator()  // While checking the wallet status
            : Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    'No Wallet Found',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _navigateToCreateWallet,
                    child: Text('Create Wallet'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(horizontal: 60, vertical: 15),
                      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
                      textStyle: TextStyle(fontSize: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class WalletCreation extends StatefulWidget {
  @override
  _WalletCreationState createState() => _WalletCreationState();
}

class _WalletCreationState extends State<WalletCreation> {
  final storage = FlutterSecureStorage();
  String mnemonic = "";

  // Function to create a new wallet and generate a mnemonic
  void createWallet() async {
    String generatedMnemonic = bip39.generateMnemonic();
    setState(() {
      mnemonic = generatedMnemonic;
    });
    await storeMnemonic(generatedMnemonic);
    _navigateToMnemonicScreen(generatedMnemonic);
  }

  Future<void> storeMnemonic(String mnemonic) async {
    await storage.write(key: 'wallet_mnemonic', value: base64Encode(utf8.encode(mnemonic)));
  }

  // Navigate to display mnemonic screen after creating the wallet
  void _navigateToMnemonicScreen(String mnemonic) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => DisplayMnemonicScreen(mnemonic: mnemonic)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create New Wallet'),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(0, 0, 0, 0),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: createWallet,
          child: Text('Generate Wallet'),
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.symmetric(horizontal: 60, vertical: 15),
            backgroundColor: const Color.fromARGB(255, 255, 255, 255),
            foregroundColor: Colors.black,
            textStyle: TextStyle(fontSize: 18),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }
}

class DisplayMnemonicScreen extends StatelessWidget {
  final String mnemonic;

  DisplayMnemonicScreen({required this.mnemonic});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Your Mnemonic'),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Your Mnemonic:',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              SizedBox(height: 10),
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.teal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  mnemonic,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.tealAccent,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
