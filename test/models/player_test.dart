import 'package:flutter_test/flutter_test.dart';
import 'package:skull_king/models/player.dart';

void main() {
  group('Player Model', () {
    test('Creates a player with default score of 0', () {
      final player = Player(id: '1', name: 'Alice');
      expect(player.id, '1');
      expect(player.name, 'Alice');
      expect(player.score, 0);
    });

    test('Creates a player with custom score', () {
      final player = Player(id: '1', name: 'Alice', score: 50);
      expect(player.score, 50);
    });

    test('validateName returns null for valid names', () {
      expect(Player.validateName('Alice'), isNull);
      expect(Player.validateName('Bob Smith'), isNull);
      expect(Player.validateName('a'), isNull);
    });

    test('validateName rejects empty names', () {
      expect(Player.validateName(''), isNotNull);
      expect(Player.validateName('   '), isNotNull);
    });

    test('validateName rejects names that are too long', () {
      final longName = 'a' * 51;
      expect(Player.validateName(longName), isNotNull);
    });

    test('copyWith creates a new player with updated fields', () {
      final original = Player(id: '1', name: 'Alice', score: 10);
      final copy = original.copyWith(score: 20);
      expect(copy.id, '1');
      expect(copy.name, 'Alice');
      expect(copy.score, 20);
    });

    test('copyWith preserves original fields when not updated', () {
      final original = Player(id: '1', name: 'Alice', score: 10);
      final copy = original.copyWith();
      expect(copy, original);
    });
  });
}
