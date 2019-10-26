﻿///////////////////////////////////////////////
//                                           //
//                     !                     //
//   This file is automatically generated!   //
//           Do not directly edit!           //
//                                           //
///////////////////////////////////////////////

use strum_macros::{ EnumString, Display, AsRefStr };

/// League of Legends game type: matched game, custom game, or tutorial game.
#[derive(Debug, Copy, Clone)]
#[derive(Eq, PartialEq, Hash)]
#[derive(EnumString, Display, AsRefStr)]
#[repr(u8)]
pub enum GameType {
    /// Custom games
    #[strum(to_string="CUSTOM_GAME")]
    CustomGame,
    /// Tutorial games
    #[strum(to_string="TUTORIAL_GAME")]
    TutorialGame,
    /// all other games
    #[strum(to_string="MATCHED_GAME")]
    MatchedGame,
}

serde_string!(GameType);
