import 'package:flutter_test/flutter_test.dart';
import 'package:skull_king/managers/player_manager.dart';

void main() {
  group('PlayerManager', () {
    late PlayerManager playerManager;

    setUp(() {
      playerManager = PlayerManager();
    });

    group('Adding Players', () {
      test('Can add a player with a unique name', () {
        final player = playerManager.addPlayer('Alice');
        expect(player.name, 'Alice');
        expect(playerManager.playerCount, 1);
      });

      test('Trims whitespace from player names', () {
        final player = playerManager.addPlayer('  Bob  ');
        expect(player.name, 'Bob');
      });

      test('Rejects empty names', () {
        expect(
          () => playerManager.addPlayer(''),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Rejects whitespace-only names', () {
        expect(
          () => playerManager.addPlayer('   '),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Rejects names that are too long', () {
        final longName = 'a' * 51;
        expect(
          () => playerManager.addPlayer(longName),
          throwsA(isA<PlayerException>()),
        );
      });
    });

    group('Duplicate Prevention', () {
      test('Prevents duplicate player names (exact match)', () {
        playerManager.addPlayer('Alice');
        expect(
          () => playerManager.addPlayer('Alice'),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Prevents duplicate player names (case-insensitive)', () {
        playerManager.addPlayer('Alice');
        expect(
          () => playerManager.addPlayer('alice'),
          throwsA(isA<PlayerException>()),
        );
        expect(
          () => playerManager.addPlayer('ALICE'),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Prevents duplicate player names with whitespace variations', () {
        playerManager.addPlayer('Alice');
        expect(
          () => playerManager.addPlayer('  Alice  '),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Allows different names', () {
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        playerManager.addPlayer('Charlie');
        expect(playerManager.playerCount, 3);
      });
    });

    group('Player Count Limits', () {
      test('Can add up to 8 players', () {
        for (int i = 1; i <= 8; i++) {
          playerManager.addPlayer('Player$i');
        }
        expect(playerManager.playerCount, 8);
      });

      test('Cannot add more than 8 players', () {
        for (int i = 1; i <= 8; i++) {
          playerManager.addPlayer('Player$i');
        }
        expect(
          () => playerManager.addPlayer('Player9'),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Can add minimum 2 players for game start', () {
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        expect(playerManager.canStartGame(), true);
      });
    });

    group('Removing Players', () {
      test('Can remove a player by ID', () {
        final player = playerManager.addPlayer('Alice');
        playerManager.removePlayer(player.id);
        expect(playerManager.playerCount, 0);
      });

      test('Can remove a player by name (case-insensitive)', () {
        playerManager.addPlayer('Alice');
        playerManager.removePlayerByName('alice');
        expect(playerManager.playerCount, 0);
      });

      test('Throws exception when removing non-existent player by ID', () {
        expect(
          () => playerManager.removePlayer('non-existent-id'),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Throws exception when removing non-existent player by name', () {
        expect(
          () => playerManager.removePlayerByName('NonExistent'),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Can add player again after removal', () {
        playerManager.addPlayer('Alice');
        playerManager.removePlayerByName('Alice');
        final newPlayer = playerManager.addPlayer('Alice');
        expect(playerManager.playerCount, 1);
        expect(newPlayer.name, 'Alice');
      });
    });

    group('Game Start Validation', () {
      test('Cannot start game with 0 players', () {
        expect(playerManager.canStartGame(), false);
        expect(
          () => playerManager.validateGameStart(),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Cannot start game with 1 player', () {
        playerManager.addPlayer('Alice');
        expect(playerManager.canStartGame(), false);
        expect(
          () => playerManager.validateGameStart(),
          throwsA(isA<PlayerException>()),
        );
      });

      test('Can start game with 2 players', () {
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        expect(playerManager.canStartGame(), true);
        expect(() => playerManager.validateGameStart(), returnsNormally);
      });

      test('Can start game with 8 players', () {
        for (int i = 1; i <= 8; i++) {
          playerManager.addPlayer('Player$i');
        }
        expect(playerManager.canStartGame(), true);
        expect(() => playerManager.validateGameStart(), returnsNormally);
      });
    });

    group('Player Retrieval', () {
      test('Can retrieve player by ID', () {
        final added = playerManager.addPlayer('Alice');
        final retrieved = playerManager.getPlayer(added.id);
        expect(retrieved, isNotNull);
        expect(retrieved!.name, 'Alice');
      });

      test('Returns null for non-existent player ID', () {
        final retrieved = playerManager.getPlayer('non-existent-id');
        expect(retrieved, isNull);
      });

      test('Can retrieve player by name (case-insensitive)', () {
        playerManager.addPlayer('Alice');
        final retrieved = playerManager.getPlayerByName('alice');
        expect(retrieved, isNotNull);
        expect(retrieved!.name, 'Alice');
      });

      test('Returns null for non-existent player name', () {
        final retrieved = playerManager.getPlayerByName('NonExistent');
        expect(retrieved, isNull);
      });
    });

    group('Player List', () {
      test('Returns immutable list of players', () {
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        final list = playerManager.players;
        expect(list.length, 2);
        expect(() => list.add(null), throwsA(isA<UnsupportedError>()));
      });

      test('Clears all players', () {
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        playerManager.clear();
        expect(playerManager.playerCount, 0);
      });
    });

    group('Integration Tests', () {
      test('Complete player setup workflow', () {
        // Add players
        playerManager.addPlayer('Alice');
        playerManager.addPlayer('Bob');
        playerManager.addPlayer('Charlie');

        // Verify all added
        expect(playerManager.playerCount, 3);
        expect(playerManager.canStartGame(), true);

        // Remove a player
        playerManager.removePlayerByName('Bob');
        expect(playerManager.playerCount, 2);
        expect(playerManager.canStartGame(), true);

        // Remove another
        playerManager.removePlayerByName('Charlie');
        expect(playerManager.playerCount, 1);
        expect(playerManager.canStartGame(), false);

        // Add back to start
        playerManager.addPlayer('David');
        expect(playerManager.playerCount, 2);
        expect(playerManager.canStartGame(), true);
      });

      test('Edge case: Add and remove players repeatedly', () {
        for (int round = 0; round < 3; round++) {
          playerManager.clear();
          playerManager.addPlayer('Player1');
          playerManager.addPlayer('Player2');
          expect(playerManager.canStartGame(), true);
          playerManager.removePlayerByName('Player1');
          expect(playerManager.canStartGame(), false);
        }
      });
    });
  });
}
