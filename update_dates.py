import re

with open('src/components/TravelSearchEngine.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

# Replace Check-in section
check_in_regex = re.compile(r"\{\/\* Check-in \*\/\}.*?(?=\{\/\* Check-out \*\/\})", re.DOTALL)
check_in_replacement = """{/* Check-in */}
            <div 
              onClick={() => checkInRef.current?.showPicker()}
              className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex items-center justify-between gap-2 cursor-pointer bg-transparent"
            >
               <div className="flex items-center gap-3 w-full">
                 <div className="text-gray-400 dark:text-white/80 shrink-0 pointer-events-none">
                   <Calendar size={20} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col justify-center flex-1">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-in</span>
                    <span className="text-gray-500 text-sm mt-0.5 font-medium">
                       {checkIn ? new Date(checkIn).toLocaleDateString() : 'Add dates'}
                    </span>
                 </div>
               </div>
               <input 
                 type="date"
                 ref={checkInRef}
                 value={checkIn}
                 min={today}
                 onChange={handleCheckInChange}
                 className="sr-only"
               />
            </div>
  
            <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>
  
            """

data = check_in_regex.sub(check_in_replacement, data)

# Replace Check-out section
check_out_regex = re.compile(r"\{\/\* Check-out \*\/\}.*?(?=\{\/\* Guests \*\/\})", re.DOTALL)
check_out_replacement = """{/* Check-out */}
            <div 
              onClick={() => checkOutRef.current?.showPicker()}
              className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex items-center justify-between gap-2 cursor-pointer bg-transparent"
            >
               <div className="flex items-center gap-3 w-full">
                 <div className="flex flex-col justify-center flex-1">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-out</span>
                    <span className="text-gray-500 text-sm mt-0.5 font-medium">
                       {checkOut ? new Date(checkOut).toLocaleDateString() : 'Add dates'}
                    </span>
                 </div>
               </div>
               <input 
                 type="date"
                 ref={checkOutRef}
                 value={checkOut}
                 min={checkIn || today}
                 onChange={(e) => setCheckOut(e.target.value)}
                 className="sr-only"
               />
            </div>
  
            <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>
  
            """

data = check_out_regex.sub(check_out_replacement, data)

with open('src/components/TravelSearchEngine.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Updated Check-in/out buttons!")
