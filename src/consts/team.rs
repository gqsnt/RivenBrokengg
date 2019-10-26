use serde_repr::{ Serialize_repr, Deserialize_repr };

/// League of Legends team.
#[derive(Debug, Copy, Clone)]
#[derive(Eq, PartialEq, Hash, Ord, PartialOrd)]
#[derive(Serialize_repr, Deserialize_repr)]
#[repr(u8)]
pub enum Team {
    /// Blue team (bottom left on Summoner's Rift).
    Blue = 100,
    /// Red team (top right on Summoner's Rift).
    Red = 200,
}
