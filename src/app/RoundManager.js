import React, {useEffect} from "react";
import RoundContext from "./RoundState";
import {useToast} from "@chakra-ui/react";
import {createBetURL} from "./util";

export const RoundManager = () => {
    const {roundState, setRoundState} = React.useContext(RoundContext);
    const toast = useToast();

    function getCurrentRoundNumber(resolve, reject) {
        if (roundState.currentRound === null) {
            // first pass-through sets the round, then bails out
            // which starts useEffect again a second time, with a round number
            fetch('https://api.neofood.club/next_round.txt', {cache: "no-cache"})
                .then(response => response.text())
                .then(data => {
                    let currentRound = parseInt(data);
                    if (isNaN(currentRound) === false) {
                        setRoundState({
                            currentRound: currentRound,
                            currentSelectedRound: roundState.currentSelectedRound || currentRound
                        })
                    } else {
                        throw Error('Cannot grab current round data');
                    }
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Current round data not found.`,
                        description: "We don't seem to know what round it currently is. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    })
                })
                .then(reject)
        } else {
            resolve();
        }
    }

    function getRoundData(forceUpdate) {
        if (roundState.currentSelectedRound === null) {
            // this should never happen
            return;
        }

        // do not update this round if it's over
        if (forceUpdate && roundState.roundData !== null && roundState.roundData.winners[0] > 0) {
            forceUpdate = false;
        }

        // if the current selected round is a round older than 2 days ago, force cache
        let cache = roundState.currentSelectedRound < (roundState.currentRound - 2) ? "force-cache" : "no-cache";

        // update if there's no data
        if (roundState.roundData === null || forceUpdate) {
            fetch(`https://api.neofood.club/rounds/${roundState.currentSelectedRound}.json`, {
                cache: cache
            })
                .then(response => response.json())
                .then(roundData => {
                    let currentRound = roundState.currentRound;
                    // if winning pirates were just added, increase the in-memory current round
                    if (currentRound === roundState.currentSelectedRound && roundData.winners[0] > 0) {
                        currentRound += 1;
                    }
                    setRoundState({roundData, currentRound});
                })
                .catch(() => {
                    toast.closeAll();
                    toast({
                        title: `Round ${roundState.currentSelectedRound} not found.`,
                        description: "We don't seem to have data for this round. 🤔",
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    });
                });
        }
    }

    useEffect(() => {
        // TODO: Debounce round number input
        new Promise((resolve, reject) => {
            getCurrentRoundNumber(resolve, reject);
        }).then(() => {
            getRoundData(false);
        }).catch(() => {
            // blah
        }).then(() => {
            // changing round/bets will keep the url updated
            if (roundState.currentSelectedRound === null) {
                return;
            }

            window.history.replaceState(null, "", createBetURL(roundState));
        });

        const refreshInterval = setInterval(() => {
            getRoundData(true);
        }, 10000);

        return () => clearInterval(refreshInterval);
    }, [
        roundState.currentSelectedRound,
        roundState.currentRound,
        roundState.roundData,
        roundState.bets,
        roundState.betAmounts
    ]);

    return null;
}
