package state

import "sync/atomic"

var RequestCount uint64

func IncrementRequestCount() uint64 {
	return atomic.AddUint64(&RequestCount, 1)
}

func GetRequestCount() uint64 {
	return atomic.LoadUint64(&RequestCount)
}