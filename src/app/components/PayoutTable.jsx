import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import {
    Box,
    Skeleton,
    Table,
    Thead,
    Th,
    Tr,
    Tbody,
    HStack,
    Spacer,
    Text,
    IconButton,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";

import { PIRATE_NAMES } from "../constants";
import { computePirateBinary } from "../maths";
import {
    numberWithCommas,
    displayAsPercent,
    PirateBgColor,
    Colors,
} from "../util";
import BetAmountInput from "./BetAmountInput";
import Pd from "./Pd";
import PlaceThisBetButton from "./PlaceThisBetButton";
import { RoundContext } from "../RoundState";
import Td from "./Td";
import TextTooltip from "./TextTooltip";

// this element is the colorful and informative table full of your bet data

const PayoutTable = (props) => {
    const { calculations, ...rest } = props;
    const { orange, red, green, yellow } = Colors();

    const {
        betBinaries,
        betExpectedRatios,
        betProbabilities,
        betNetExpected,
        betOdds,
        betPayoffs,
        betMaxBets,
        winningBetBinary,
        totalBetAmounts,
        totalBetExpectedRatios,
        totalBetNetExpected,
        totalWinningPayoff,
        totalWinningOdds,
        totalEnabledBets,
    } = calculations;

    const { roundState, setRoundState } = useContext(RoundContext);
    const amountOfBets = Object.keys(roundState.bets).length;

    function swapBets(index, newIndex) {
        let bets = roundState.bets;
        let betAmounts = roundState.betAmounts;
        [bets[index], bets[newIndex]] = [bets[newIndex], bets[index]];
        [betAmounts[index], betAmounts[newIndex]] = [
            betAmounts[newIndex],
            betAmounts[index],
        ];
        setRoundState({ bets: { ...bets }, betAmounts: { ...betAmounts } });
    }

    function getMaxBetColor(betNum) {
        let betAmount = roundState.betAmounts[betNum];
        let div = 1_000_000 / betOdds[betNum];
        if (betAmount > Math.ceil(div)) {
            return orange;
        }
        if (betAmount > Math.floor(div)) {
            return yellow;
        }
        return "transparent";
    }

    return (
        <Table size="sm" width="auto" {...rest}>
            <Thead>
                <Tr>
                    <Th>Bet #</Th>
                    <Th>Amount</Th>
                    <Th>Odds</Th>
                    <Th>Payoff</Th>
                    <Th>
                        <TextTooltip text="Prob." label="Probability" />
                    </Th>
                    <Th>
                        <TextTooltip text="E.R." label="Expected Ratio" />
                    </Th>
                    <Th>
                        <TextTooltip text="N.E." label="Net Expected" />
                    </Th>
                    <Th>Maxbet</Th>
                    <Th>Shipwreck</Th>
                    <Th>Lagoon</Th>
                    <Th>Treasure</Th>
                    <Th>Hidden</Th>
                    <Th>Harpoon</Th>
                    <Th>Submit</Th>
                </Tr>
            </Thead>

            {roundState.roundData ? (
                <>
                    <Tbody>
                        {[...Array(amountOfBets)].map((e, betIndex) => {
                            const betBinary = betBinaries[betIndex + 1];

                            if (betBinary === 0) {
                                return null;
                            }

                            let er = betExpectedRatios[betIndex + 1];
                            let erBg = er - 1 < 0 ? red : "transparent";

                            let ne = betNetExpected[betIndex + 1];
                            let neBg = ne - 1 < 0 ? red : "transparent";

                            let betAmount = roundState.betAmounts[betIndex + 1];
                            let baBg =
                                betAmount < 50
                                    ? red
                                    : getMaxBetColor(betIndex + 1);
                            let mbBg = getMaxBetColor(betIndex + 1);

                            let betNumBgColor = "transparent";

                            if (winningBetBinary) {
                                betNumBgColor =
                                    (winningBetBinary & betBinary) === betBinary
                                        ? green
                                        : red;
                            }

                            return (
                                <Tr key={betIndex}>
                                    <Pd backgroundColor={betNumBgColor}>
                                        <HStack>
                                            <Spacer />
                                            <Text>{betIndex + 1}</Text>

                                            {roundState.viewMode === false && (
                                                <HStack spacing="1px">
                                                    <IconButton
                                                        size="xs"
                                                        height="20px"
                                                        icon={<ArrowUpIcon />}
                                                        onClick={() =>
                                                            swapBets(
                                                                betIndex + 1,
                                                                betIndex
                                                            )
                                                        }
                                                        isDisabled={
                                                            betIndex === 0
                                                        }
                                                    />
                                                    <IconButton
                                                        size="xs"
                                                        height="20px"
                                                        icon={<ArrowDownIcon />}
                                                        onClick={() =>
                                                            swapBets(
                                                                betIndex + 1,
                                                                betIndex + 2
                                                            )
                                                        }
                                                        isDisabled={
                                                            betIndex ===
                                                            amountOfBets - 1
                                                        }
                                                    />
                                                </HStack>
                                            )}

                                            <Spacer />
                                        </HStack>
                                    </Pd>
                                    <Pd>
                                        <BetAmountInput
                                            betIndex={betIndex}
                                            isInvalid={baBg !== "transparent"}
                                            errorBorderColor={baBg}
                                        />
                                    </Pd>
                                    <Td isNumeric>
                                        {numberWithCommas(
                                            betOdds[betIndex + 1]
                                        )}
                                        :1
                                    </Td>
                                    <Td isNumeric>
                                        {numberWithCommas(
                                            betPayoffs[betIndex + 1]
                                        )}
                                    </Td>
                                    <Td isNumeric>
                                        <TextTooltip
                                            text={displayAsPercent(
                                                betProbabilities[betIndex + 1],
                                                3
                                            )}
                                            label={displayAsPercent(
                                                betProbabilities[betIndex + 1]
                                            )}
                                        />
                                    </Td>
                                    <Td isNumeric backgroundColor={erBg}>
                                        {er.toFixed(3)}:1
                                    </Td>
                                    <Td isNumeric backgroundColor={neBg}>
                                        {numberWithCommas(ne.toFixed(2))}
                                    </Td>
                                    <Td isNumeric backgroundColor={mbBg}>
                                        {numberWithCommas(
                                            betMaxBets[betIndex + 1]
                                        )}
                                    </Td>
                                    {[...Array(5)].map((e, arenaIndex) => {
                                        let pirateIndex =
                                            roundState.bets[betIndex + 1][
                                                arenaIndex
                                            ];
                                        let bgColor = "transparent";
                                        if (pirateIndex) {
                                            if (winningBetBinary) {
                                                const pirateBin =
                                                    computePirateBinary(
                                                        arenaIndex,
                                                        pirateIndex
                                                    );
                                                if (
                                                    (winningBetBinary &
                                                        pirateBin) ===
                                                    pirateBin
                                                ) {
                                                    bgColor = green;
                                                } else {
                                                    bgColor = red;
                                                }
                                            } else {
                                                bgColor = PirateBgColor(
                                                    roundState.roundData
                                                        .openingOdds[
                                                        arenaIndex
                                                    ][pirateIndex]
                                                );
                                            }
                                        }
                                        return (
                                            <Td
                                                key={arenaIndex}
                                                backgroundColor={bgColor}
                                            >
                                                {
                                                    PIRATE_NAMES[
                                                        roundState.roundData
                                                            .pirates[
                                                            arenaIndex
                                                        ][pirateIndex - 1]
                                                    ]
                                                }
                                            </Td>
                                        );
                                    })}
                                    <Td>
                                        <PlaceThisBetButton
                                            bet={roundState.bets[betIndex + 1]}
                                            betNum={betIndex + 1}
                                            calculations={calculations}
                                        />
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                    <Tbody>
                        <Tr>
                            <Th isNumeric>Total:</Th>
                            <Th isNumeric>
                                {numberWithCommas(totalBetAmounts)}
                            </Th>
                            <Th isNumeric>
                                {winningBetBinary > 0 && (
                                    <Text>
                                        {numberWithCommas(totalWinningOdds)}:
                                        {totalEnabledBets}
                                    </Text>
                                )}
                            </Th>
                            <Th isNumeric>
                                {winningBetBinary > 0 && (
                                    <Text>
                                        {numberWithCommas(totalWinningPayoff)}
                                    </Text>
                                )}
                            </Th>
                            <Th />
                            <Th isNumeric>
                                {totalBetExpectedRatios.toFixed(3)}
                            </Th>
                            <Th isNumeric>
                                {numberWithCommas(
                                    totalBetNetExpected.toFixed(2)
                                )}
                            </Th>
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                            <Th />
                        </Tr>
                    </Tbody>
                </>
            ) : (
                <Tbody>
                    {[...Array(amountOfBets)].map((e, betIndex) => {
                        return (
                            <Tr>
                                <Td colSpan={14}>
                                    <Skeleton height="30px">
                                        <Box>&nbsp;</Box>
                                    </Skeleton>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            )}
        </Table>
    );
};

export default PayoutTable;
