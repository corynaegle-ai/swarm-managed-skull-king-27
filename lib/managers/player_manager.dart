import 'package:uuid/uuid.dart';
import '../models/player.dart';

/// Exception thrown when player operations fail
class PlayerException implements Exception {
  final String message;
  PlayerException(this.message);

  @override
  String toString() => message;
}

/// Manages player operations during game setup
class PlayerManager {
  static const int minPlayers = 2;
  static const int maxPlayers = 8;
  static const _uuid = Uuid();

  final List<Player> _players = [];

  /// Returns the current list of players
  List<Player> get players => List.unmodifiable(_players);

  /// Returns the current number of players
  int get playerCount => _players.length;

  /// Checks if a player name already exists (case-insensitive)
  bool _playerNameExists(String name) {
    final normalizedName = name.trim().toLowerCase();
    return _players.any((p) => p.name.toLowerCase() == normalizedName);
  }

  /// Adds a new player to the game
  ///
  /// Throws [PlayerException] if:
  /// - The name is invalid
  /// - A player with that name already exists
  /// - The maximum number of players is reached
  Player addPlayer(String name) {
    // Validate name format
    final validationError = Player.validateName(name);
    if (validationError != null) {
      throw PlayerException(validationError);
    }

    final trimmedName = name.trim();

    // Check for duplicate names (case-insensitive)
    if (_playerNameExists(trimmedName)) {
      throw PlayerException(
          'A player with the name "$trimmedName" already exists');
    }

    // Check player limit
    if (_players.length >= maxPlayers) {
      throw PlayerException(
          'Cannot add more than $maxPlayers players');
    }

    final newPlayer = Player(
      id: _uuid.v4(),
      name: trimmedName,
    );

    _players.add(newPlayer);
    return newPlayer;
  }

  /// Removes a player by their ID
  ///
  /// Throws [PlayerException] if the player is not found
  void removePlayer(String playerId) {
    final index = _players.indexWhere((p) => p.id == playerId);
    if (index == -1) {
      throw PlayerException('Player with ID "$playerId" not found');
    }
    _players.removeAt(index);
  }

  /// Removes a player by their name (case-insensitive)
  ///
  /// Throws [PlayerException] if the player is not found
  void removePlayerByName(String name) {
    final normalizedName = name.trim().toLowerCase();
    final index = _players.indexWhere(
        (p) => p.name.toLowerCase() == normalizedName);
    if (index == -1) {
      throw PlayerException('Player with name "$name" not found');
    }
    _players.removeAt(index);
  }

  /// Gets a player by their ID
  Player? getPlayer(String playerId) {
    try {
      return _players.firstWhere((p) => p.id == playerId);
    } catch (e) {
      return null;
    }
  }

  /// Gets a player by their name (case-insensitive)
  Player? getPlayerByName(String name) {
    final normalizedName = name.trim().toLowerCase();
    try {
      return _players.firstWhere(
          (p) => p.name.toLowerCase() == normalizedName);
    } catch (e) {
      return null;
    }
  }

  /// Checks if the game can start
  ///
  /// Returns true if there are at least [minPlayers] players
  bool canStartGame() => _players.length >= minPlayers;

  /// Validates that the game can start
  ///
  /// Throws [PlayerException] if there are fewer than [minPlayers] players
  void validateGameStart() {
    if (!canStartGame()) {
      throw PlayerException(
          'At least $minPlayers players are required to start the game');
    }
  }

  /// Clears all players (useful for resetting or testing)
  void clear() {
    _players.clear();
  }
}
