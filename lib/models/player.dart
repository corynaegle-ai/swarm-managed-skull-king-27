/// Represents a player in the Skull King game
class Player {
  final String id;
  final String name;
  int score;

  Player({
    required this.id,
    required this.name,
    this.score = 0,
  });

  /// Validates that a player name is valid
  static String? validateName(String name) {
    final trimmed = name.trim();
    if (trimmed.isEmpty) {
      return 'Player name cannot be empty';
    }
    if (trimmed.length > 50) {
      return 'Player name cannot exceed 50 characters';
    }
    return null;
  }

  /// Creates a copy of this player with updated fields
  Player copyWith({
    String? id,
    String? name,
    int? score,
  }) {
    return Player(
      id: id ?? this.id,
      name: name ?? this.name,
      score: score ?? this.score,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Player &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
